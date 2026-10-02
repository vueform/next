/*
 * Dist-only type tests for `part:*` / `class:*` / `reclass:*` shorthand attrs.
 * Requires a prior core build (`vite build`) so `shorthands.d.ts` exists.
 * Run by `pnpm test:dts`.
 *
 * Source `Vf*Props` stay clean; vf-build injects these keys into published
 * types via the `#shorthands` marker on each `unstyled.ts`.
 */
import { describe, expectTypeOf, test } from 'vitest'
import '../../dist/components/VfSelect/unstyled'
import '../../dist/components/VfText/unstyled'
import type { VfSelectProps } from '../../dist/components/VfSelect/types'
import type { VfTextProps } from '../../dist/components/VfText/types'

describe('shorthand attrs on dist props', () => {
  test('VfText props carry the injected shorthand keys plus their own', () => {
    expectTypeOf<VfTextProps>().toHaveProperty('part:input')
    expectTypeOf<VfTextProps>().toHaveProperty('class:input')
    expectTypeOf<VfTextProps>().toHaveProperty('reclass:input')
    expectTypeOf<VfTextProps>().toHaveProperty('inputType')
  })

  test('VfSelect props carry the injected shorthand keys plus their own', () => {
    expectTypeOf<VfSelectProps>().toHaveProperty('part:input')
    expectTypeOf<VfSelectProps>().toHaveProperty('class:input')
    expectTypeOf<VfSelectProps>().toHaveProperty('reclass:input')
    expectTypeOf<VfSelectProps>().toHaveProperty('items')
  })

  test('shorthand values accept a callable form', () => {
    type TextPartInput = NonNullable<VfTextProps['part:input']>
    expectTypeOf<Extract<TextPartInput, (...args: any) => any>>().not.toBeNever()

    type SelectClassInput = NonNullable<VfSelectProps['class:input']>
    expectTypeOf<Extract<SelectClassInput, (...args: any) => any>>().not.toBeNever()
  })
})
