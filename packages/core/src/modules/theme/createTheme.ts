import {
  computed,
  ref,
  toValue,
  type App,
  type CSSProperties,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type { DarkModeConfig, ThemeModule } from './types'
import { type VueformInstance, type VueformConfig } from '#core/helpers'
import { getSecurityModule, type SecurityModule } from '#core/modules/security'
import { isDev, normalize, warn } from '#core/utils'

/**
 * Converts a camelCase or kebab-case theme key to a `--vf-*` CSS custom
 * property name. Keys already prefixed with `--vf-` are returned as-is.
 * Kebab-case keys (containing `-`) are prefixed directly.
 */
function normalizeThemeKey(key: string): string {
  if (key.startsWith('--vf-')) return key
  if (key.includes('-')) return `--vf-${key}`

  let kebab = key
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z]{2,})(\d)/g, '$1-$2')

  return `--vf-${kebab.toLowerCase()}`
}

const THEME_KEY_RE = /^--vf-[a-zA-Z0-9_-]+$/

/**
 * Reference graph of a theme's token map, keyed by `--vf-*` CSS custom property
 * names. `defs` holds the resolved (`var(--vf-*)`) definition of every token
 * whose value references other tokens; `dependents` maps each referenced token
 * to the tokens defined in terms of it.
 */
interface ThemeTokenGraph {
  defs: Map<string, string>
  dependents: Map<string, Set<string>>
}

/**
 * Whether a normalized token key may be interpolated into CSS text: it must be
 * a plain `--vf-*` custom property name. Token maps are schema-reachable (the
 * `tokens` prop), and the rendered `<style>` sinks interpolate declarations
 * verbatim — a key carrying anything else could break out of the scoped rule.
 * Values are guarded separately by the security module's `sanitizeCss`.
 *
 * @param key The normalized (`--vf-*`) token key.
 */
function isSafeThemeKey(key: string): boolean {
  return THEME_KEY_RE.test(key)
}

/**
 * Replaces `$tokenName` references in a value string with
 * `var(--vf-token-name)` CSS variable references.
 */
function resolveThemeRefs(value: string): string {
  return value.replace(/\$([a-zA-Z][a-zA-Z0-9]*)/g, (_, key) => {
    return `var(${normalizeThemeKey(key)})`
  })
}

/**
 * Builds the reference graph of a token map. Only string values containing
 * `$ref`s participate — concrete values have no edges and never need
 * re-declaration.
 */
function buildThemeTokenGraph(
  tokens: Record<string, unknown>
): ThemeTokenGraph {
  const defs = new Map<string, string>()
  const dependents = new Map<string, Set<string>>()

  for (const [key, value] of Object.entries(tokens)) {
    if (key === 'dark' || key === 'css') continue
    if (typeof value !== 'string' || !value.includes('$')) continue

    const cssVar = normalizeThemeKey(key)
    defs.set(cssVar, resolveThemeRefs(value))

    for (const match of value.matchAll(/\$([a-zA-Z][a-zA-Z0-9]*)/g)) {
      const ref = normalizeThemeKey(match[1])
      let set = dependents.get(ref)
      if (!set) {
        set = new Set()
        dependents.set(ref, set)
      }
      set.add(cssVar)
    }
  }

  return { defs, dependents }
}

function setTokenDecl(
  decls: Map<string, string>,
  key: string,
  value: unknown,
  { $security }: { $security: Pick<SecurityModule, 'sanitizeCss'> }
): void {
  const cssVar = normalizeThemeKey(key)

  const resolved =
    typeof value === 'number'
      ? String(value)
      : typeof value === 'string'
        ? resolveThemeRefs(value)
        : undefined

  if (resolved === undefined) return

  // Same containment as `makeTokens`: this path is developer-config trust,
  // but the rendered stylesheet interpolates declarations verbatim, so the
  // brace/key validation applies everywhere CSS text is built.
  if (
    !isSafeThemeKey(cssVar) ||
    $security.sanitizeCss(resolved) === undefined
  ) {
    if (isDev()) {
      warn(
        `token \`${key}\` was dropped — token keys must normalize to plain \`--vf-*\` names and values must not contain \`{\` or \`}\`.`
      )
    }
    return
  }

  decls.set(cssVar, resolved)
}

function formatDecls(decls: Map<string, string>): string {
  const lines: string[] = []
  for (const [cssVar, value] of decls) {
    lines.push(`  ${cssVar}: ${value};`)
  }
  return lines.join('\n')
}

function indentBlock(block: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return block
    .split('\n')
    .map((line) => (line.length ? pad + line : line))
    .join('\n')
}

function createIsDark(config: DarkModeConfig = 'system'): Ref<boolean> {
  const isDark = ref(false)

  if (typeof window === 'undefined') return isDark

  if (config === 'system') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    isDark.value = mql.matches

    const handler = (e: MediaQueryListEvent) => {
      isDark.value = e.matches
    }

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler)
    } else {
      ;(mql as any).addListener(handler)
    }

    return isDark
  }

  const el = document.documentElement

  isDark.value = el.matches(config)

  new MutationObserver(() => {
    isDark.value = el.matches(config)
  }).observe(el, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  })

  return isDark
}

function generateThemeCss(
  theme: Record<string, any> | undefined,
  options: {
    darkMode?: DarkModeConfig
    scopedDarkMode?: boolean
    darkClass?: string
    lightClass?: string
  },
  { $security }: { $security: Pick<SecurityModule, 'sanitizeCss'> }
): string {
  const {
    darkMode = 'system',
    scopedDarkMode = false,
    darkClass = 'vf-dark',
    lightClass = 'vf-light',
  } = options

  if (!theme || Object.keys(theme).length === 0) return ''

  const rootDecls = new Map<string, string>()
  const darkDecls = new Map<string, string>()

  for (const [key, value] of Object.entries(theme)) {
    if (key === 'css') continue

    if (key === 'dark' && typeof value === 'object' && value !== null) {
      for (const [dk, dv] of Object.entries(value)) {
        setTokenDecl(darkDecls, dk, dv, { $security })
      }
      continue
    }

    setTokenDecl(rootDecls, key, value, { $security })
  }

  const parts: string[] = []

  if (rootDecls.size) {
    parts.push(`:root {\n${formatDecls(rootDecls)}\n}`)
  }

  if (darkDecls.size) {
    const body = formatDecls(darkDecls)

    if (darkMode === 'system') {
      parts.push(
        `@media (prefers-color-scheme: dark) {\n  :root {\n${indentBlock(body, 4)}\n  }\n}`
      )
    } else {
      parts.push(`:root${darkMode} {\n${body}\n}`)
    }
  }

  if (scopedDarkMode && rootDecls.size) {
    const darkScopedDecls = new Map(rootDecls)
    for (const [k, v] of darkDecls) {
      darkScopedDecls.set(k, v)
    }
    parts.push(`.${darkClass} {\n${formatDecls(darkScopedDecls)}\n}`)

    parts.push(`.${lightClass} {\n${formatDecls(rootDecls)}\n}`)
  }

  return parts.join('\n\n')
}

function generateCssGrid(
  breakpoints: Record<string, string | number>,
  formatter: VueformConfig['cols'],
  mobileFirst: boolean = true
) {
  const makeCol = (size?: number | string, breakpoint?: string) => {
    return `.${formatter(normalize(size), breakpoint)} { grid-column: span ${size ?? 12} / span 12; }`
  }

  let css = ``

  css +=
    `${makeCol()}\n` + [...Array(12)].map((_, i) => makeCol(i + 1)).join('\n')

  // In mobile-first mode breakpoints are emitted ascending so that larger
  // `min-width` rules win later in source order. In desktop-first mode the
  // order must be reversed so that smaller `max-width` rules (the more
  // specific overrides) win at narrow viewports where every query matches.
  const sizes = Object.keys(breakpoints)
  const orderedSizes = mobileFirst ? sizes : sizes.slice().reverse()

  for (const size of orderedSizes) {
    const value = breakpoints[size]
    const breakpoint = typeof value === 'number' ? `${value}px` : value

    css +=
      `\n\n@media (${mobileFirst ? 'min' : 'max'}-width: ${breakpoint}) {\n` +
      `  ${makeCol(undefined, size)}\n` +
      `${[...Array(12)].map((_, i) => `  ${makeCol(i + 1, size)}`).join('\n')}\n\n` +
      `  .vf-align-label .${formatter(undefined, size)}\\:vf-vertical,\n` +
      `  :not(.vf-align-label) .${formatter(undefined, size)}\\:vf-vertical {\n` +
      `    padding-top: 0;\n` +
      `  }\n\n` +
      `  .vf-align-label .${formatter(undefined, size)}\\:vf-horizontal {\n` +
      `    padding-top: var(--vf-label-offset);\n` +
      `  }\n` +
      `}`
  }

  return css
}

function injectCss(
  app: App,
  styleId: string,
  css: string,
  useHead: boolean,
  nonce?: string
) {
  let injectedViaHead = false

  if (useHead !== false) {
    try {
      const head =
        app._context.provides?.usehead ?? app.config.globalProperties?.$head

      if (head && typeof head.push === 'function') {
        head.push({
          style: [{ id: styleId, innerHTML: css, ...(nonce ? { nonce } : {}) }],
        })

        injectedViaHead = true
      }
    } catch {}
  }

  if (injectedViaHead || typeof document === 'undefined') {
    return
  }

  const existing = document.getElementById(styleId)
  if (existing) {
    if (isDev() && existing.textContent !== css) {
      warn(
        `[vueform] A <style id="${styleId}"> with different content already ` +
          'exists — another Vueform instance uses the same `build.styleId`. ' +
          'Give each instance a distinct `build.styleId`.'
      )
    }
    existing.textContent = css
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = css
  if (nonce) {
    style.setAttribute('nonce', nonce)
  }
  document.head.insertBefore(style, document.head.firstChild)
}

/**
 * Generates the full CSS string from the Vueform config, including grid
 * utilities and theme custom properties. Exposed on the theme module definition
 * (`theme.getCSS`) and consumed by `vueform.getCSS()` for SSR/SSG style
 * extraction.
 *
 * @param config The resolved Vueform configuration.
 */
export function getCSS(vueform: VueformInstance) {
  const { config } = vueform
  const parts: string[] = []
  if (config.grid) {
    parts.push(
      generateCssGrid(config.breakpoints, config.cols, config.mobileFirst)
    )
  }
  // Lazy doorway: `getCSS` runs at install/SSR time, after every module is
  // created, so the security module is always resolvable here.
  const themeCss = generateThemeCss(
    config.tokens,
    {
      darkMode: config.darkMode,
      scopedDarkMode: config.build?.scopedDarkMode,
      darkClass: config.build?.darkClass,
      lightClass: config.build?.lightClass,
    },
    { $security: getSecurityModule(vueform) }
  )
  if (themeCss) parts.push(themeCss)
  return parts.join('\n\n')
}

/**
 * Injects the full generated CSS (theme variables + grid) into the document —
 * via `useHead` when available, otherwise a `<style>` tag. Called once by the
 * module's install hook.
 *
 * @param app The Vue app instance.
 * @param config The resolved Vueform configuration.
 */
export function injectThemeCss(app: App, vueform: VueformInstance) {
  const { config } = vueform
  const css = getCSS(vueform)

  if (css) {
    injectCss(
      app,
      config.build?.styleId ?? 'vueform-style',
      css,
      config.useHead,
      config.nonce
    )
  }
}

/**
 * Creates a theme instance from the given config.
 *
 * @param config The resolved Vueform configuration.
 */
export function createTheme(vueform: VueformInstance): ThemeModule {
  const { config } = vueform
  const globalIsDark = createIsDark(config.darkMode)

  const resolveValue = (value: string | number): string =>
    typeof value === 'number' ? String(value) : resolveThemeRefs(value)

  // Theme tokens referencing other tokens (`$gutter` → `var(--vf-gutter)`)
  // are resolved on `:root`, so a scoped override of the referenced token
  // never reaches them — custom properties containing `var()` compute where
  // they are declared, and descendants inherit the already-resolved value.
  // These graphs let scoped overrides re-declare every dependent token on the
  // overridden element, where the refs resolve against the override. Built
  // lazily: apps that never pass a `tokens` prop skip the cost.
  let lightGraph: ThemeTokenGraph | undefined
  let darkGraph: ThemeTokenGraph | undefined

  const getGraph = (dark: boolean): ThemeTokenGraph => {
    if (dark) {
      return (darkGraph ??= buildThemeTokenGraph({
        ...config.tokens,
        ...(config.tokens?.dark as Record<string, unknown> | undefined),
      }))
    }
    return (lightGraph ??= buildThemeTokenGraph(config.tokens ?? {}))
  }

  const emitDependents = (style: Record<string, string>, dark: boolean) => {
    const graph = getGraph(dark)
    const seen = new Set(Object.keys(style))
    const queue = [...seen]

    while (queue.length) {
      const cssVar = queue.pop()!
      const deps = graph.dependents.get(cssVar)
      if (!deps) continue

      for (const dep of deps) {
        if (seen.has(dep)) continue
        seen.add(dep)
        style[dep] = graph.defs.get(dep)!
        queue.push(dep)
      }
    }
  }

  const makeTokens = (
    tokens: MaybeRefOrGetter<Record<string, any>>,
    dark?: MaybeRefOrGetter<boolean | undefined>
  ): ComputedRef<CSSProperties> => {
    const isDark = computed(() => {
      const explicit = toValue(dark)
      return explicit !== undefined ? explicit : globalIsDark.value
    }) as ComputedRef<boolean>

    return computed<CSSProperties>(() => {
      const raw = toValue(tokens)
      const style: Record<string, string> = {}

      if (!raw) return style

      // Token maps are schema-reachable and their declarations are
      // interpolated into rendered `<style>` text — refuse keys/values that
      // could break out of the scoped rule.
      const assign = (key: string, value: string) => {
        const normalized = normalizeThemeKey(key)

        if (
          !isSafeThemeKey(normalized) ||
          getSecurityModule(vueform).sanitizeCss(value) === undefined
        ) {
          if (isDev()) {
            warn(
              `token \`${key}\` was dropped — token keys must normalize to plain \`--vf-*\` names and values must not contain \`{\` or \`}\`.`
            )
          }
          return
        }

        style[normalized] = value
      }

      for (const [key, value] of Object.entries(raw)) {
        if (key === 'dark' || key === 'css') continue

        if (typeof value === 'number') {
          assign(key, String(value))
        } else if (typeof value === 'string') {
          assign(key, resolveValue(value))
        }
      }

      if (isDark.value && raw.dark && typeof raw.dark === 'object') {
        for (const [key, value] of Object.entries(raw.dark)) {
          if (typeof value === 'number') {
            assign(key, String(value))
          } else if (typeof value === 'string') {
            assign(key, resolveValue(value))
          }
        }
      }

      if (Object.keys(style).length) {
        emitDependents(style, isDark.value)
      }

      return style
    })
  }

  return {
    makeTokens,
  }
}
