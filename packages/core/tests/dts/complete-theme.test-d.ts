/*
 * Type-level tests for `CompleteTheme` — the exhaustive theme shape adapters
 * use to type their `defineTheme` helper. Every top-level token of the base
 * map must be defined, `dark` must be present (`{}` opts out), and custom
 * keys beyond the base set are accepted. Run by `pnpm test:dts`.
 */
import {
  extendTheme,
  defineTheme as defineLooseTheme,
  type CompleteTheme,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'

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

describe('CompleteTheme adapter defineTheme', () => {
  test('a complete definition passes; `dark: {}` opts out of a dark variant', () => {
    defineTheme({
      brand: '#111',
      gutter: '2rem',
      inputColor: '#222',
      dark: {},
    })
  })

  test('custom tokens beyond the base set are accepted, top-level and in `dark`', () => {
    defineTheme({
      brand: '#111',
      gutter: '2rem',
      inputColor: '#222',
      myCustom: '1px',
      dark: { brand: '#eee', myCustom: '2px' },
    })
  })

  test('a missing base token is rejected', () => {
    // @ts-expect-error — `inputColor` is missing.
    defineTheme({
      brand: '#111',
      gutter: '2rem',
      dark: {},
    })
  })

  test('the `dark` block must be explicit', () => {
    // @ts-expect-error — the `dark` block must be explicit.
    defineTheme({
      brand: '#111',
      gutter: '2rem',
      inputColor: '#222',
    })
  })

  test("a typo'd key fails because the real key goes missing", () => {
    defineTheme({
      brand: '#111',
      gutter: '2rem',
      // @ts-expect-error — `inputColour` is not `inputColor`.
      inputColour: '#222',
      dark: {},
    })
  })
})

describe('extendTheme', () => {
  test("keeps the base's type and accepts partial overrides", () => {
    expectTypeOf(
      extendTheme(base, {
        brand: '#333',
        dark: { gutter: '2px' },
      })
    ).toExtend<typeof base>()
  })
})

describe("core's structure-agnostic defineTheme", () => {
  test('accepts any token vocabulary…', () => {
    defineLooseTheme({
      myOwnToken: '1px',
      anotherOne: 2,
      dark: { myOwnToken: '2px' },
    })
  })

  test('…but still demands the explicit `dark` block', () => {
    // @ts-expect-error — `dark` is required.
    defineLooseTheme({
      myOwnToken: '1px',
    })
  })
})
