/*
 * Dist type tests for `@vueform/core` as a consumer sees it: imports resolve
 * through the exports map to built dist types (tsconfig `paths` is empty), so
 * a prior core build is required. Run by `pnpm test:dts-dist`.
 *
 * These assertions gate the build's d.ts post-processing:
 * - the `declare module '…/index.ts'` → `declare module '@vueform/core'`
 *   rewrite (an unrewritten augmentation would no longer merge into
 *   `ControlRegistry`),
 * - the `#shorthands`-marker `part:*`/`class:*`/`reclass:*` key injection,
 * - the exports-map `types` targets themselves.
 */
import { describe, expectTypeOf, test } from 'vitest'
import type { ControlRegistry } from '@vueform/core'
import type { VfTextProps } from '@vueform/core/components/VfText'
import type { GlobalComponents } from 'vue'

describe('dist module augmentations', () => {
  test('unstyled component import augments ControlRegistry on @vueform/core', () => {
    expectTypeOf<ControlRegistry>().toHaveProperty('VfText')
  })

  test('unstyled component import augments GlobalComponents on vue', () => {
    expectTypeOf<GlobalComponents>().toHaveProperty('VfText')
  })
})

describe('dist shorthand props (exports-map resolution)', () => {
  test('VfText props carry the injected shorthand keys plus their own', () => {
    expectTypeOf<VfTextProps>().toHaveProperty('part:input')
    expectTypeOf<VfTextProps>().toHaveProperty('class:input')
    expectTypeOf<VfTextProps>().toHaveProperty('reclass:input')
    expectTypeOf<VfTextProps>().toHaveProperty('inputType')
  })
})
