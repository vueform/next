/*
 * Dist type tests for `@vueform/primevue` as a consumer sees it: imports
 * resolve through the exports maps to built dist types — including the
 * adapter's d.ts type-checking against `@vueform/core`'s BUILT dist types
 * (the dts `paths` override in the adapter build). Requires a prior build of
 * core and primevue. Run by `pnpm test:dts-dist`.
 *
 * Gates the adapter build's d.ts post-processing:
 * - cross-package augmentation targets (`declare module '@vueform/core'`
 *   written from the adapter's rewritten d.ts),
 * - the `#shorthands` injection on adapter components,
 * - exports-map `types` targets for styled/unstyled tiers.
 */
import { describe, expectTypeOf, test } from 'vitest'
import type { ControlRegistry } from '@vueform/core'
import type { VfSelectProps } from '@vueform/primevue/components/VfSelect/unstyled'
import type { GlobalComponents } from 'vue'

describe('adapter dist module augmentations', () => {
  test('adapter component augments ControlRegistry on @vueform/core', () => {
    expectTypeOf<ControlRegistry>().toHaveProperty('VfSelect')
  })

  test('adapter component augments GlobalComponents on vue', () => {
    expectTypeOf<GlobalComponents>().toHaveProperty('VfSelect')
  })
})

describe('adapter dist props (exports-map resolution)', () => {
  test('VfSelect props resolve against built core types', () => {
    expectTypeOf<VfSelectProps>().toHaveProperty('options')
  })

  test('VfSelect props carry injected shorthand keys', () => {
    expectTypeOf<
      Extract<keyof VfSelectProps, `part:${string}`>
    >().not.toBeNever()
    expectTypeOf<
      Extract<keyof VfSelectProps, `class:${string}`>
    >().not.toBeNever()
  })
})
