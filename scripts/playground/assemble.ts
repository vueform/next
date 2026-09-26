/**
 * Assembles a playground from an engine base template plus the adapter's own
 * playground fragments and metadata — nothing adapter- or mode-specific lives
 * in the base templates.
 *
 * Per adapter (`packages/<adapter>/`):
 *
 * - `playground/setup.ts` (required) → `src/adapter.setup.ts`: app-level wiring
 *   (`installApp`) and `vueformConfig` merged into `createVueform()`.
 * - `playground/demo.ts` (required) → `demo.schema.ts`: the demo schema.
 * - `playground/vite.ts` (optional) → `vite.adapter.ts`: extra Vite plugins.
 * - `playground/nuxt.ts` (optional) → `nuxt.adapter.ts`: extra Nuxt config.
 * - `package.json > vueform.playground`: `entry` (createVueform subpath),
 *   `vaporInterop`, `deps` / `vaporDeps` / `nuxtDeps`, `head` (index.html).
 *
 * Vapor is a derived mode of the vite engine: vue is pinned to the catalog's
 * `vue-vapor` version, SFCs are vapor-compiled, and the `vapor` exports
 * condition serves the vapor dist when source serving is off (DIST=1) — no
 * `/vapor` subpath imports needed.
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Combo } from './lib'

interface PlaygroundMeta {
  entry?: string
  vaporInterop?: boolean
  deps?: Record<string, string>
  vaporDeps?: Record<string, string>
  nuxtDeps?: Record<string, string>
  head?: string[]
}

interface AdapterAssets {
  pkgName: string
  version: string
  meta: PlaygroundMeta
  fragmentsDir: string
}

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function loadAdapterAssets(repoRoot: string, adapter: string): AdapterAssets {
  const pkgDir = path.join(repoRoot, 'packages', adapter)
  const pkg = readJson(path.join(pkgDir, 'package.json'))
  const fragmentsDir = path.join(pkgDir, 'playground')

  for (const required of ['setup.ts', 'demo.ts']) {
    if (!fs.existsSync(path.join(fragmentsDir, required))) {
      throw new Error(
        `[pg] Adapter "${adapter}" has no playground fragment ` +
          `packages/${adapter}/playground/${required} — every adapter needs ` +
          `setup.ts and demo.ts to generate a playground.`
      )
    }
  }

  return {
    pkgName: pkg.name,
    version: pkg.version,
    meta: pkg.vueform?.playground ?? {},
    fragmentsDir,
  }
}

/**
 * The pinned Vapor-mode vue version, from the workspace catalog's `vue-vapor`
 * entry (`npm:vue@<version>`).
 */
function vaporVueVersion(repoRoot: string): string {
  const yaml = fs.readFileSync(
    path.join(repoRoot, 'pnpm-workspace.yaml'),
    'utf8'
  )
  const match = yaml.match(/^\s*vue-vapor:\s*npm:vue@(\S+)/m)
  if (!match) {
    throw new Error(
      '[pg] No `vue-vapor: npm:vue@<version>` entry in the pnpm-workspace.yaml catalog.'
    )
  }
  return match[1]
}

function sortObject(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))
  )
}

function buildPackageJson(
  repoRoot: string,
  combo: Combo,
  assets: AdapterAssets
): string {
  const pkg = readJson(path.join(combo.templateDir, 'package.json'))
  const deps: Record<string, string> = pkg.dependencies ?? {}

  deps[assets.pkgName] = `^${assets.version}`
  Object.assign(deps, assets.meta.deps)

  if (combo.mode === 'nuxt') {
    Object.assign(deps, assets.meta.nuxtDeps)
  } else if (combo.mode === 'vapor') {
    Object.assign(deps, assets.meta.vaporDeps)
    deps.vue = vaporVueVersion(repoRoot)
    pkg.scripts['dev:dist'] = 'DIST=1 vite'
    // Standalone installs run their own build scripts.
    pkg.pnpm = { onlyBuiltDependencies: ['esbuild'] }
  }

  pkg.dependencies = sortObject(deps)
  return JSON.stringify(pkg, null, 2) + '\n'
}

function buildMainTs(combo: Combo, assets: AdapterAssets): string {
  const vapor = combo.mode === 'vapor'
  const interop = vapor && !!assets.meta.vaporInterop
  const entry = assets.meta.entry
  const vueformEntry = entry ? `${assets.pkgName}/${entry}` : assets.pkgName

  return [
    `import './debug'`,
    `import './style.css'`,
    `import { createVueform } from '${vueformEntry}'`,
    vapor
      ? `import { createVaporApp${interop ? ', vaporInteropPlugin' : ''}, type VaporComponent } from 'vue'`
      : `import { createApp } from 'vue'`,
    `import App from './App.vue'`,
    `import { installApp, vueformConfig } from './adapter.setup'`,
    `import config from '../vueform.config'`,
    ``,
    ...(vapor
      ? [
          `// The SFC is vapor-compiled at runtime (vite plugin \`features.vapor\`),`,
          `// but vue-language-tools still types it as a vdom component.`,
          `const app = createVaporApp(App as unknown as VaporComponent)`,
        ]
      : [`const app = createApp(App)`]),
    ``,
    ...(interop ? [`app.use(vaporInteropPlugin)`, ``] : []),
    `installApp(app, { vapor: ${vapor} })`,
    ``,
    `app.use(`,
    `  createVueform({`,
    `    ...vueformConfig,`,
    `    ...config,`,
    `  })`,
    `)`,
    ``,
    `app.mount('#app')`,
    ``,
  ].join('\n')
}

function buildViteConfigTs(combo: Combo, assets: AdapterAssets): string {
  const vapor = combo.mode === 'vapor'
  const interop = vapor && !!assets.meta.vaporInterop
  const lines = [
    `import vue from '@vitejs/plugin-vue'`,
    `import { dev } from '@vueform/utils'`,
    `import { defineConfig } from 'vite'`,
    `import { vitePlugins } from './vite.adapter'`,
    ``,
  ]

  if (vapor) {
    lines.push(
      `// DIST=1 disables source serving, so imports resolve to the built dist`,
      `// through the real exports maps — used to verify the actual packaging.`,
      `const dist = !!process.env.DIST`,
      ``
    )
  }

  lines.push(`export default defineConfig({`)

  if (interop) {
    lines.push(
      `  define: {`,
      `    // Selects the vapor function form of shared dual-mode directives`,
      `    // when serving package source via the dev plugin.`,
      `    __VUEFORM_VAPOR__: JSON.stringify(true),`,
      `  },`
    )
  }

  lines.push(
    `  plugins: [`,
    vapor
      ? `    // Everything — the app's SFCs and (in dev) Vueform's source SFCs —`
      : `    vue(),`,
    ...(vapor
      ? [
          `    // is vapor-compiled: this playground is 100% vapor.`,
          `    vue({ features: { vapor: true } }),`,
          `    ...(dist ? [] : [dev('${combo.adapter}')]),`,
        ]
      : [`    dev('${combo.adapter}'),`]),
    `    ...vitePlugins({ vapor: ${vapor} }),`,
    `  ],`
  )

  if (vapor) {
    lines.push(
      `  resolve: {`,
      `    // The 'vapor' exports condition serves the vapor dist build when the`,
      `    // dev plugin is off (DIST=1). Dedupe forces every \`vue\` import to`,
      `    // this playground's 3.6 (Vapor) copy when sources are served.`,
      `    conditions: ['vapor'],`,
      `    dedupe: ['vue'],`,
      `  },`
    )
  }

  lines.push(`})`, ``)
  return lines.join('\n')
}

function buildNuxtConfigTs(combo: Combo): string {
  return [
    `import { dev } from '@vueform/utils'`,
    `import adapterConfig from './nuxt.adapter'`,
    ``,
    `// The adapter fragment's modules are concatenated; other keys are`,
    `// shallow-spread into the config.`,
    `const adapter = adapterConfig as Parameters<typeof defineNuxtConfig>[0]`,
    ``,
    `export default defineNuxtConfig({`,
    `  compatibilityDate: '2025-05-27',`,
    `  devtools: { enabled: true },`,
    `  telemetry: false,`,
    `  ...adapter,`,
    `  modules: [...(adapter.modules ?? []), '@vueform/nuxt'],`,
    `  vueform: {`,
    `    adapter: '${combo.adapter}',`,
    `    locales: ['en_US'],`,
    `  },`,
    `  vite: {`,
    `    plugins: [dev('${combo.adapter}')],`,
    `  },`,
    `})`,
    ``,
  ].join('\n')
}

function buildVueformConfigTs(assets: AdapterAssets): string {
  return [
    `import exprEval from '@vueform/expr-eval'`,
    `import { defineConfig } from '${assets.pkgName}'`,
    ``,
    `export default defineConfig({`,
    `  plugins: [exprEval()],`,
    `  darkMode: '.dark',`,
    `})`,
    ``,
  ].join('\n')
}

const VITE_ADAPTER_STUB = [
  `import type { Plugin } from 'vite'`,
  ``,
  `export function vitePlugins(_mode: { vapor: boolean }): Plugin[] {`,
  `  return []`,
  `}`,
  ``,
].join('\n')

const NUXT_ADAPTER_STUB = `export default {} as Record<string, unknown>\n`

function copyFragment(
  assets: AdapterAssets,
  name: string,
  dest: string,
  fallback?: string
) {
  const src = path.join(assets.fragmentsDir, name)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
  } else if (fallback != null) {
    fs.writeFileSync(dest, fallback)
  }
}

/**
 * Writes the assembled (adapter- and mode-specific) files into a playground
 * directory that already holds a copy of the engine base template.
 */
export function assemblePlayground(repoRoot: string, combo: Combo) {
  const assets = loadAdapterAssets(repoRoot, combo.adapter)
  const out = (rel: string, content: string) =>
    fs.writeFileSync(path.join(combo.dir, rel), content)

  out('package.json', buildPackageJson(repoRoot, combo, assets))

  if (combo.mode === 'nuxt') {
    out('nuxt.config.ts', buildNuxtConfigTs(combo))
    out('vueform.config.ts', buildVueformConfigTs(assets))
    copyFragment(assets, 'demo.ts', path.join(combo.dir, 'demo.schema.ts'))
    copyFragment(
      assets,
      'nuxt.ts',
      path.join(combo.dir, 'nuxt.adapter.ts'),
      NUXT_ADAPTER_STUB
    )
    return
  }

  // vite / vapor
  const html = fs
    .readFileSync(path.join(combo.dir, 'index.html'), 'utf8')
    .replace(
      /[ \t]*<!--#head-->\n/,
      (assets.meta.head ?? []).map((line) => `    ${line}\n`).join('')
    )
  out('index.html', html)

  out('vite.config.ts', buildViteConfigTs(combo, assets))
  out('vueform.config.ts', buildVueformConfigTs(assets))
  out(path.join('src', 'main.ts'), buildMainTs(combo, assets))
  copyFragment(
    assets,
    'setup.ts',
    path.join(combo.dir, 'src', 'adapter.setup.ts')
  )
  copyFragment(assets, 'demo.ts', path.join(combo.dir, 'src', 'demo.schema.ts'))
  copyFragment(
    assets,
    'vite.ts',
    path.join(combo.dir, 'vite.adapter.ts'),
    VITE_ADAPTER_STUB
  )
}
