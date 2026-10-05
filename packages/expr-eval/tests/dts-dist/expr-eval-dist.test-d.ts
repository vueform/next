/*
 * Dist type tests for `@vueform/expr-eval` as a consumer sees it: imports
 * resolve through the exports map to the built dist types. Requires a prior
 * build of core and this plugin. Run by `pnpm test:dts-dist`.
 *
 * Gates the tsdown build's d.ts output: the bundled type surface keeps the
 * typed default plugin factory and the named expression helpers.
 */
import exprEval, { EMPTY, NOT, defineFunction } from '@vueform/expr-eval'
import { describe, expectTypeOf, test } from 'vitest'

describe('expr-eval dist types', () => {
  test('exports the plugin factory', () => {
    expectTypeOf(exprEval).toBeFunction()
  })

  test('exports typed expression helpers', () => {
    expectTypeOf(defineFunction).toBeFunction()
    expectTypeOf(NOT).toBeFunction()
    expectTypeOf(EMPTY).toBeFunction()
  })
})
