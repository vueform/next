/*
 * Type-level tests for augmenting a component's class map. A custom
 * template that registers a key of its own via `useClasses()` can type it by
 * augmenting the component's `*Classes` interface; the key must then flow into
 * the context's `classes`, the `classes` / `reclass` props, and schema entries.
 * Run by `pnpm test:dts`.
 */
import { defineSchema, type ClassValue, type ContextOf } from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/core/components'
import type { VfTextProps } from '@vueform/core/components/VfText'

declare module '@vueform/core/components/VfText' {
  interface VfTextClasses {
    augmentedIcon: ClassValue
  }
}

type TextContext = ContextOf<'VfText'>

describe('VfTextClasses augmentation', () => {
  test('the augmented key is typed on the context — not the `any` fallback', () => {
    expectTypeOf<TextContext['classes']['augmentedIcon']>().not.toBeAny()
    expectTypeOf<
      TextContext['classes']['augmentedIcon']
    >().toEqualTypeOf<ClassValue>()
  })

  test('declared keys are unaffected', () => {
    expectTypeOf<TextContext['classes']['input']>().toEqualTypeOf<ClassValue>()
  })

  test('the `classes` / `reclass` props know the key', () => {
    expectTypeOf<NonNullable<VfTextProps['classes']>>().toHaveProperty(
      'augmentedIcon'
    )
    expectTypeOf<NonNullable<VfTextProps['reclass']>>().toHaveProperty(
      'augmentedIcon'
    )
  })

  test('schema entries accept it (contextual form included)', () => {
    defineSchema({
      email: {
        type: 'text',
        classes: { augmentedIcon: 'text-gray-400' },
        reclass: { augmentedIcon: (el$) => (el$.hasError ? 'red' : 'gray') },
      },
    })
  })
})
