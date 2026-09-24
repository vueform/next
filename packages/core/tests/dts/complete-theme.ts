/*
 * Compile-time assertions for `CompleteTheme` — the exhaustive theme shape
 * adapters use to type their `defineTheme` helper. Every top-level token of
 * the base map must be defined, `dark` must be present (`{}` opts out), and
 * custom keys beyond the base set are accepted. Validated by `pnpm tsc:types`.
 */
import { extendTheme, defineTheme as defineLooseTheme, type CompleteTheme } from '@vueform/core'

const base = {
  brand: '#07bf9b',
  gutter: '1rem',
  inputColor: '$gray900',
  dark: { brand: '#0f0' },
}

// Mirrors the adapter-side helper (`defineTheme` from `@vueform/ui/themes`).
function defineTheme<T extends CompleteTheme<typeof base>>(theme: T): T {
  return theme
}

// A complete definition passes; `dark: {}` opts out of a dark variant.
defineTheme({
  brand: '#111',
  gutter: '2rem',
  inputColor: '#222',
  dark: {},
})

// Custom tokens beyond the base set are accepted, top-level and in `dark`.
defineTheme({
  brand: '#111',
  gutter: '2rem',
  inputColor: '#222',
  myCustom: '1px',
  dark: { brand: '#eee', myCustom: '2px' },
})

// @ts-expect-error — `inputColor` is missing.
defineTheme({
  brand: '#111',
  gutter: '2rem',
  dark: {},
})

// @ts-expect-error — the `dark` block must be explicit.
defineTheme({
  brand: '#111',
  gutter: '2rem',
  inputColor: '#222',
})

// A typo'd key fails because the real key goes missing.
defineTheme({
  brand: '#111',
  gutter: '2rem',
  // @ts-expect-error — `inputColour` is not `inputColor`.
  inputColour: '#222',
  dark: {},
})

// `extendTheme` keeps the base's type and accepts partial overrides.
const extended: typeof base = extendTheme(base, {
  brand: '#333',
  dark: { gutter: '2px' },
})
void extended

// Core's structure-agnostic `defineTheme` accepts any token vocabulary…
defineLooseTheme({
  myOwnToken: '1px',
  anotherOne: 2,
  dark: { myOwnToken: '2px' },
})

// …but still demands the explicit `dark` block.
// @ts-expect-error — `dark` is required.
defineLooseTheme({
  myOwnToken: '1px',
})
