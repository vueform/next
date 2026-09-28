/**
 * Validates the per-component theme-chunk imports of an adapter
 * (`src/components/<Name>/styles.ts`) against the `vf-*` classes each component
 * can emit. The styles.ts imports are the single source of truth for
 * per-component CSS — this validation exists so they can never drift.
 *
 * How it works:
 *
 * 1. Compiles every chunk the adapter draws from — its own `src/scss` files plus
 *    any layered core chunks — with sass on the fly (no dist needed, so it runs
 *    before the build and always reflects the current sources) and parses them
 *    into a multi-valued class → (provider) index, where a provider is
 *    `own:<chunk>` (the adapter's own scss) or `core:<chunk>` (a core chunk the
 *    adapter's aggregate recipe layers under its own). A class occurrence is
 *    gated by its compound selector: `.vf-btn.vf-text` only counts for
 *    components that also emit `vf-btn`. `@keyframes` names are tracked so
 *    chunks that animate with another chunk's keyframes require it.
 * 2. Collects each component's emitted classes: string literals in its SFC sources
 *    (the adapter's own, falling back to core's for re-exported components).
 *    The adapter config's baseClasses (`*element`) attribute to VfLayout — its
 *    template renders the wrapper DOM that carries them.
 * 3. Classes with no standalone selector in any chunk are semantic hooks for
 *    userland styling and are ignored.
 * 4. Because components resolve through global registration, every element renders
 *    inside VfLayout — chunks VfLayout imports count as a baseline that
 *    satisfies other components' requirements.
 * 5. Classes on the whitelist in utils' config.json (`classWhitelist`, exact names
 *    or `prefix-*` patterns, `global` plus per-adapter lists) satisfy selector
 *    mates without any component emitting them — classes that exist outside
 *    component sources, like vendor internals (`p-*`, `pi`) or classes core
 *    formatters produce (`vf-horizontal`).
 *
 * styles.ts declares own chunks as `#<adapter>/scss/<chunk>.scss` and core
 * chunks as `@vueform/core/<chunk>.css`. Where an own chunk shadows a layered
 * core chunk of the same name, BOTH are required — the own chunk styles on top
 * of core's base rules.
 *
 * Fails when a component emits a class whose providing chunk(s) are not
 * imported.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { findWorkspaceRoot, loadSassCompiler } from './shared'

interface Occurrence {
  provider: string
  /**
   * Every other class in the whole selector.
   */
  mates: Set<string>
  /**
   * The subset of `mates` sharing a compound with the class — classes that must
   * sit on the same element for the rule to apply.
   */
  compoundMates: Set<string>
}

/**
 * Adapter-specific validation data under `vueform.validateSource` in the
 * adapter's manifest.
 */
export interface ValidateSourceConfig {
  /**
   * Core chunks the adapter's aggregate recipe layers its own chunks onto
   * (`core:` provider space). Omitted when the adapter's own chunks ARE core's
   * (forwarders) — core is not a separate provider space then.
   */
  coreRecipeChunks?: string[]
}

export interface ValidateSourceOptions {
  /**
   * The adapter package's directory (the invoking package's cwd).
   */
  packageDir: string
  /**
   * Print each component's declared and matched providers.
   */
  verbose?: boolean
  /**
   * Print inferred styles.ts content per component instead of validating — used
   * to seed/refresh the sidecars.
   */
  suggest?: boolean
}

function stripParens(selector: string): string {
  let out = selector
  for (let prev = ''; prev !== out;) {
    prev = out
    out = out.replace(/\([^()]*\)/g, '')
  }
  return out
}

function skipBlock(css: string, openBrace: number): number {
  let depth = 0
  for (let i = openBrace; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}' && --depth === 0) return i + 1
  }
  return css.length
}

function extractClassTokens(source: string): Set<string> {
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    .replace(/<!--[\s\S]*?-->/g, '')
  const out = new Set<string>()
  // Plain string literals plus template literals without interpolation.
  for (const m of stripped.matchAll(
    /'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`\\\n$]*)`/g
  )) {
    for (const token of (m[1] ?? m[2] ?? m[3]).split(/\s+/)) {
      if (/^vf-[a-z0-9-]+$/.test(token)) out.add(token)
    }
  }
  return out
}

/**
 * Validates the adapter's styles.ts imports (see the module docblock). Returns
 * the number of problems found (0 = OK); prints errors, warnings and the
 * summary itself.
 */
export function validateSource(options: ValidateSourceOptions): number {
  const pkgDir = path.resolve(options.packageDir)
  const { verbose = false, suggest = false } = options

  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
  )
  const adapterName = path.basename(pkgDir)
  const config: ValidateSourceConfig = manifest.vueform?.validateSource ?? {}

  // Whitelisted classes (utils' config.json) satisfy selector mates without
  // any component emitting them: exact names or `prefix-*` patterns, from the
  // `global` list plus the adapter's own.
  const whitelistConfig: Record<string, string[]> =
    JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8')
    ).classWhitelist ?? {}
  const whitelist = [
    ...(whitelistConfig.global ?? []),
    ...(whitelistConfig[adapterName] ?? []),
  ]
  const whitelisted = (cls: string): boolean =>
    whitelist.some((pattern) =>
      pattern.endsWith('*')
        ? cls.startsWith(pattern.slice(0, -1))
        : cls === pattern
    )

  const root = findWorkspaceRoot(pkgDir)
  const componentsDir = path.join(pkgDir, 'src/components')
  const configFile = path.join(pkgDir, 'src/config.ts')
  const ownScssDir = path.join(pkgDir, 'src/scss')
  const coreScssDir = path.join(root, 'packages/core/src/scss')
  const coreComponentsDir = path.join(root, 'packages/core/src/components')

  // -------------------------------------------------------------------------
  // 1. Chunk CSS → class providers + keyframes
  // -------------------------------------------------------------------------

  const providers = new Map<string, Occurrence[]>()
  const keyframesDefined = new Map<string, string>()
  const keyframesUsed = new Map<string, Set<string>>()

  function recordSelectors(provider: string, selectorText: string) {
    for (const sel of selectorText.split(',')) {
      const compounds = stripParens(sel)
        .split(/[\s>+~]+/)
        .filter(Boolean)
        .map((c) =>
          [...c.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)].map((m) => m[1])
        )
      if (!compounds.length) continue
      // A class occurrence is gated by every OTHER vf-class in the whole
      // selector: a rule only styles anything when all of them are present, so
      // `.vf-element .vf-knob` never makes .vf-element require the knob chunk,
      // and `.vf-slider .vf-label` never makes .vf-label require slider —
      // while `.vf-tab-wrapper.vf-invalid .vf-tab` still ties .vf-invalid to
      // the tabs chunk for components that emit the tab classes.
      // Vendor classes (PrimeVue's p-*) gate too; the class whitelist
      // satisfies them, since no component emits them.
      const all = compounds.flat()
      for (const cls of new Set(all)) {
        if (!cls.startsWith('vf-')) continue
        const mates = new Set(all.filter((c) => c !== cls))
        const compoundMates = new Set(
          compounds
            .filter((compound) => compound.includes(cls))
            .flat()
            .filter((c) => c !== cls)
        )
        let list = providers.get(cls)
        if (!list) providers.set(cls, (list = []))
        list.push({ provider, mates, compoundMates })
      }
    }
  }

  function parseChunk(provider: string, css: string) {
    const source = css.replace(/\/\*[\s\S]*?\*\//g, '')

    for (const m of source.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) {
      for (const name of m[1].matchAll(/vf-[A-Za-z0-9_-]+/g)) {
        let used = keyframesUsed.get(provider)
        if (!used) keyframesUsed.set(provider, (used = new Set()))
        used.add(name[0])
      }
    }

    let buf = ''
    for (let i = 0; i < source.length; i++) {
      const ch = source[i]
      if (ch === '{') {
        const head = buf.trim()
        buf = ''
        if (head.startsWith('@keyframes')) {
          keyframesDefined.set(head.replace('@keyframes', '').trim(), provider)
          i = skipBlock(source, i) - 1
        } else if (!head.startsWith('@')) {
          recordSelectors(provider, head)
        }
        // At-rules with selectors inside (@media, @supports) just descend.
      } else if (ch === '}') {
        buf = ''
      } else {
        buf += ch
      }
    }
  }

  if (!fs.existsSync(ownScssDir)) {
    console.error(
      `[validate:source] ${path.relative(root, ownScssDir)} not found`
    )
    return 1
  }

  // Chunks are compiled from the scss sources on the fly — the same compiler
  // and package-specifier importer the build's themeScss plugin uses — so
  // validation runs before any build exists and always reflects the current
  // sources. `theme.scss` is the aggregate recipe, never a chunk.
  const sass = loadSassCompiler(pkgDir)
  const importers = [
    {
      findFileUrl(url: string) {
        return url.startsWith('@vueform/core/')
          ? pathToFileURL(
              path.join(coreScssDir, url.slice('@vueform/core/'.length))
            )
          : null
      },
    },
  ]
  const compileChunk = (file: string): string =>
    sass.compile(file, { style: 'expanded', importers }).css

  for (const file of fs
    .readdirSync(ownScssDir)
    .filter((f) => f.endsWith('.scss'))) {
    if (file === 'theme.scss') continue
    parseChunk(
      `own:${path.basename(file, '.scss')}`,
      compileChunk(path.join(ownScssDir, file))
    )
  }
  for (const chunk of config.coreRecipeChunks ?? []) {
    const file = path.join(coreScssDir, `${chunk}.scss`)
    if (fs.existsSync(file)) parseChunk(`core:${chunk}`, compileChunk(file))
  }

  // -------------------------------------------------------------------------
  // 2. Emitted classes per component
  // -------------------------------------------------------------------------

  function sfcDir(name: string): string {
    const own = path.join(componentsDir, name)
    if (fs.readdirSync(own).some((f) => f.endsWith('.vue'))) return own
    return path.join(coreComponentsDir, name)
  }

  function emittedClasses(name: string): Set<string> {
    const dir = sfcDir(name)
    const out = new Set<string>()
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.vue'))) {
      for (const cls of extractClassTokens(
        fs.readFileSync(path.join(dir, file), 'utf8')
      )) {
        out.add(cls)
      }
    }
    if (name === 'VfLayout') {
      for (const cls of extractClassTokens(fs.readFileSync(configFile, 'utf8')))
        out.add(cls)
    }
    return out
  }

  // -------------------------------------------------------------------------
  // 3. Declared providers per component (the styles.ts imports)
  // -------------------------------------------------------------------------

  function declaredProviders(name: string): Set<string> {
    const stylesPath = path.join(componentsDir, name, 'styles.ts')
    if (!fs.existsSync(stylesPath)) return new Set()
    const source = fs.readFileSync(stylesPath, 'utf8')
    const out = new Set<string>()
    for (const m of source.matchAll(/#[\w-]+\/scss\/([\w-]+)\.scss/g))
      out.add(`own:${m[1]}`)
    for (const m of source.matchAll(/@vueform\/core\/([\w-]+)\.css/g))
      out.add(`core:${m[1]}`)
    return out
  }

  function renderImport(provider: string): string {
    const [space, chunk] = provider.split(':')
    return space === 'own'
      ? `import '#${adapterName}/scss/${chunk}.scss'`
      : `import '@vueform/core/${chunk}.css'`
  }

  // -------------------------------------------------------------------------
  // 4. Run
  // -------------------------------------------------------------------------

  const components = fs
    .readdirSync(componentsDir)
    .filter(
      (e) =>
        e.startsWith('Vf') &&
        fs.statSync(path.join(componentsDir, e)).isDirectory()
    )
    .sort()

  const errors: string[] = []
  const baseline = declaredProviders('VfLayout')
  // Layout wrapper classes are present around every element — selector mates
  // like `.vf-label-group` in `.vf-slider .vf-label-group + …` should not
  // gate a component that renders inside the layout anyway.
  const layoutClasses = emittedClasses('VfLayout')

  for (const name of components) {
    const emitted = emittedClasses(name)
    const declared = declaredProviders(name)
    const matched = new Set<string>()
    const needed = new Set<string>()
    const openRequirements: string[][] = []
    // Absolute path so terminals render the error location as a link.
    const stylesFile = path.join(componentsDir, name, 'styles.ts')

    for (const cls of [...emitted].sort()) {
      const occurrences = providers.get(cls)
      if (!occurrences) continue // semantic hook — no selector anywhere
      const qualifying = occurrences.filter((o) =>
        [...o.mates].every(
          (m) =>
            emitted.has(m) ||
            (m.startsWith('vf-') && layoutClasses.has(m)) ||
            // Whitelisted classes (utils' config.json) are classes no
            // component emits — vendor internals (p-knob-text), classes core
            // formatters produce (vf-horizontal). As a separate element in
            // the selector they are ambient context and satisfy the mate;
            // on the SAME element as the class they must actually be
            // rendered by the component (`.p-button.vf-left` belongs only
            // to the component wrapping the button), so they disqualify.
            (whitelisted(m) && !o.compoundMates.has(m))
        )
      )
      if (qualifying.length === 0) continue

      // Own and layered-core providers are separate requirements: where an
      // own chunk shadows a core chunk it styles ON TOP of it.
      const spaces: string[][] = []
      const own = [
        ...new Set(
          qualifying
            .filter((o) => o.provider.startsWith('own:'))
            .map((o) => o.provider)
        ),
      ]
      const core = [
        ...new Set(
          qualifying
            .filter((o) => o.provider.startsWith('core:'))
            .map((o) => o.provider)
        ),
      ]
      if (own.length) spaces.push(own)
      if (core.length) spaces.push(core)

      for (const options of spaces) {
        const declaredHit = options.find((p) => declared.has(p))
        if (declaredHit) {
          matched.add(declaredHit)
          needed.add(declaredHit)
        } else if (
          name !== 'VfLayout' &&
          options.some((p) => baseline.has(p))
        ) {
          // Satisfied by the layout baseline every element renders within.
        } else if (suggest) {
          openRequirements.push(options)
        } else {
          errors.push(
            `${adapterName}/${name}: emits .${cls} but none of its providing chunk(s) [${options.join(', ')}] are imported in ${stylesFile}`
          )
        }
      }
    }

    // Greedy resolution of multi-provider requirements: providers covering
    // the most requirements win (so vf-left on VfCol picks grid, which its
    // other classes need anyway, not button).
    while (suggest && openRequirements.length) {
      const unresolved = openRequirements.filter(
        (options) => !options.some((p) => needed.has(p))
      )
      if (!unresolved.length) break
      const votes = new Map<string, number>()
      for (const options of unresolved) {
        for (const p of options) votes.set(p, (votes.get(p) ?? 0) + 1)
      }
      const winner = [...votes.entries()].sort(
        (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)
      )[0][0]
      needed.add(winner)
    }

    for (const provider of declared) {
      for (const kf of keyframesUsed.get(provider) ?? []) {
        const owner = keyframesDefined.get(kf)
        if (!owner || owner === provider) continue
        if (declared.has(owner)) matched.add(owner)
        else
          errors.push(
            `${adapterName}/${name}: chunk '${provider}' animates with '${kf}' from '${owner}' — import it in ${stylesFile}`
          )
      }
    }

    if (suggest) {
      for (const provider of [...needed]) {
        for (const kf of keyframesUsed.get(provider) ?? []) {
          const owner = keyframesDefined.get(kf)
          if (owner && owner !== provider) needed.add(owner)
        }
      }
      if (needed.size) {
        console.log(
          `### ${name}\n${[...needed].sort().map(renderImport).join('\n')}\n`
        )
      }
      continue
    }

    if (verbose) {
      console.log(
        `${name}: declared=[${[...declared].sort().join(', ')}] matched=[${[...matched].sort().join(', ')}]`
      )
    }
  }

  if (suggest) return 0

  if (errors.length) {
    for (const error of errors) console.error(`[validate:source] ${error}`)
    const count = `${errors.length} problem(s)`
    console.error(
      `\nFAILED — ${process.stderr.isTTY ? `\x1b[31m${count}\x1b[0m` : count}\n`
    )
    return errors.length
  }
  const summary = `OK — ${components.length} components checked`
  console.log(process.stdout.isTTY ? `\x1b[32m${summary}\x1b[0m` : summary)
  return 0
}
