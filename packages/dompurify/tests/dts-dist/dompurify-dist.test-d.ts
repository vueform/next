import type { SecurityModuleOptions } from '@vueform/core'
/*
 * Dist type tests for `@vueform/dompurify` as a consumer sees it: imports
 * resolve through the exports map to the built dist types. Requires a prior
 * build of core and this plugin. Run by `pnpm test:dts-dist`.
 *
 * Gates the tsdown build's d.ts output: the `declare module '@vueform/core'`
 * augmentation and the typed default plugin factory.
 */
import dompurify, { domPurifySanitizer } from '@vueform/dompurify'
import { describe, expectTypeOf, test } from 'vitest'

describe('dompurify dist types', () => {
  test('augments SecurityModuleOptions on @vueform/core', () => {
    expectTypeOf<SecurityModuleOptions>().toHaveProperty('sanitizeOptions')
    expectTypeOf<SecurityModuleOptions>().toHaveProperty('sanitizeInit')
  })

  test('exports the plugin factory and sanitizer builder', () => {
    expectTypeOf(dompurify).toBeFunction()
    expectTypeOf(domPurifySanitizer).toBeFunction()
  })
})
