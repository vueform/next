/**
 * Pre-release e2e smoke for the component registries + CLI + built packages.
 *
 * For each adapter it scaffolds a THROWAWAY app in .smoke-tmp/<adapter> (never
 * touching playground/ or .playgrounds/, which hold real user code):
 *
 * 1. copies the app template from scripts/smoke/<adapter>,
 * 2. symlinks the built workspace package(s) into its node_modules,
 * 3. runs the real CLI: `vueform copy all --dir src/vueform`,
 * 4. injects a `data-local-copy` marker into one copied component,
 * 5. boots a vite dev server and drives it with Playwright/Chromium: the marked
 *    LOCAL copy must render (proving the barrel-registered copy overrides the
 *    built-in), typing must flow into the v-model.
 *
 * Usage: node scripts/smoke-e2e.mjs [--ui] [--primevue] (default: both)
 */
import { execFileSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const repoRoot = process.cwd()
const require = createRequire(path.join(repoRoot, 'noop.js'))

interface SmokeTarget {
  pkg: string
  links: Record<string, string>
  markerFile: string
  markerAnchor: string
  port: number
}

const TARGETS: Record<string, SmokeTarget> = {
  ui: {
    pkg: '@vueform/ui',
    links: {
      '@vueform/ui': 'packages/ui',
      '@vueform/core': 'packages/core',
    },
    // File to mark + the anchor line the marker attribute is inserted after.
    markerFile: 'VfText.vue',
    markerAnchor: '      <input\n',
    port: 5311,
  },
  primevue: {
    pkg: '@vueform/primevue',
    links: {
      '@vueform/primevue': 'packages/primevue',
      '@vueform/core': 'packages/core',
      primevue: 'packages/primevue/node_modules/primevue',
      '@primevue/core': 'packages/primevue/node_modules/@primevue/core',
      '@primeuix/themes': 'packages/primevue/node_modules/@primeuix/themes',
    },
    markerFile: 'VfInputText.vue',
    markerAnchor: '      <InputText\n',
    port: 5312,
  },
}

function resolvePlaywright() {
  try {
    return require('playwright')
  } catch {
    const pnpmDir = path.join(repoRoot, 'node_modules', '.pnpm')
    const entry = fs
      .readdirSync(pnpmDir)
      .find((name) => /^playwright@/.test(name))
    if (!entry) throw new Error('playwright not found in the workspace')
    return createRequire(path.join(pnpmDir, entry, 'node_modules', 'noop.js'))(
      'playwright'
    )
  }
}

function scaffold(name: string, target: SmokeTarget) {
  const tmp = path.join(repoRoot, '.smoke-tmp', name)
  fs.rmSync(tmp, { recursive: true, force: true })
  fs.cpSync(path.join(repoRoot, 'scripts', 'smoke', name), tmp, {
    recursive: true,
  })

  // Declares the adapter dependency so the CLI's adapter detection works;
  // resolution comes from the symlinks below, no install involved.
  fs.writeFileSync(
    path.join(tmp, 'package.json'),
    JSON.stringify(
      {
        name: `vueform-smoke-${name}`,
        private: true,
        type: 'module',
        dependencies: { [target.pkg]: '*' },
      },
      null,
      2
    ) + '\n'
  )

  for (const [specifier, rel] of Object.entries(target.links)) {
    const dest = path.join(tmp, 'node_modules', specifier)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.symlinkSync(path.join(repoRoot, rel), dest)
  }

  return tmp
}

function runCli(tmp: string) {
  execFileSync(
    process.execPath,
    [
      path.join(repoRoot, 'packages', 'cli', 'bin', 'vueform.js'),
      'copy',
      'all',
      '--dir',
      'src/vueform',
    ],
    { cwd: tmp, stdio: 'pipe' }
  )
}

function injectMarker(tmp: string, target: SmokeTarget) {
  const file = path.join(tmp, 'src', 'vueform', target.markerFile)
  const source = fs.readFileSync(file, 'utf8')
  if (!source.includes(target.markerAnchor)) {
    throw new Error(`${target.markerFile}: marker anchor not found`)
  }
  fs.writeFileSync(
    file,
    source.replace(
      target.markerAnchor,
      `${target.markerAnchor}        data-local-copy\n`
    )
  )
}

function startVite(tmp: string, port: number) {
  const child = spawn(
    'pnpm',
    [
      'exec',
      'vite',
      '--port',
      String(port),
      '--strictPort',
      '--clearScreen',
      'false',
    ],
    { cwd: tmp, stdio: ['ignore', 'pipe', 'pipe'] }
  )
  let output = ''
  child.stdout.on('data', (d) => (output += d))
  child.stderr.on('data', (d) => (output += d))
  return { child, getOutput: () => output }
}

async function waitForServer(port: number, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}`)
      if (res.ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`vite did not start on :${port} within ${timeoutMs}ms`)
}

async function drive(_name: string, port: number, chromium: any) {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({
      viewport: { width: 900, height: 600 },
    })
    // Fail on any page error (missing directive, resolution errors, ...).
    const pageErrors: string[] = []
    page.on('pageerror', (err: Error) => pageErrors.push(err.message))
    page.on('console', (msg: { type(): string; text(): string }) => {
      if (msg.type() === 'error') pageErrors.push(msg.text())
    })

    await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' })

    const marker = page.locator('input[data-local-copy]')
    await marker.waitFor({ state: 'visible', timeout: 15000 })

    await marker.fill('smoke-check')
    const model = await page
      .locator('[data-test="model"]')
      .textContent({ timeout: 5000 })
    if (!model || !model.includes('smoke-check')) {
      throw new Error(`model did not update (got: ${JSON.stringify(model)})`)
    }

    if (pageErrors.length) {
      throw new Error(`page errors:\n${pageErrors.join('\n')}`)
    }
  } finally {
    await browser.close()
  }
}

async function smokeTarget(name: string, chromium: any) {
  const target = TARGETS[name]
  console.log(`[smoke:${name}] scaffolding throwaway app`)
  const tmp = scaffold(name, target)

  console.log(`[smoke:${name}] vueform copy all --dir src/vueform`)
  runCli(tmp)
  injectMarker(tmp, target)

  console.log(`[smoke:${name}] starting vite on :${target.port}`)
  const server = startVite(tmp, target.port)

  try {
    await waitForServer(target.port)
    console.log(`[smoke:${name}] driving with chromium`)
    await drive(name, target.port, chromium)
    console.log(`[smoke:${name}] PASS — local copy rendered, model synced`)
    return true
  } catch (err) {
    console.error(`[smoke:${name}] FAIL — ${(err as Error).message}`)
    const tail = server.getOutput().split('\n').slice(-15).join('\n')
    if (tail.trim()) console.error(`[smoke:${name}] vite output:\n${tail}`)
    return false
  } finally {
    server.child.kill('SIGTERM')
    fs.rmSync(tmp, { recursive: true, force: true })
  }
}

const args = process.argv.slice(2)
const selected = Object.keys(TARGETS).filter((name) =>
  args.length ? args.includes(`--${name}`) : true
)

const { chromium } = resolvePlaywright()
let failed = false

for (const name of selected) {
  if (!(await smokeTarget(name, chromium))) failed = true
}

fs.rmSync(path.join(repoRoot, '.smoke-tmp'), { recursive: true, force: true })

process.exit(failed ? 1 : 0)
