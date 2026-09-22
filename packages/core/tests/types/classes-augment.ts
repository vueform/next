/*
 * Compile-time assertions for augmenting a component's class map. A custom
 * template that registers a key of its own via `useClasses()` can type it by
 * augmenting the component's `*Classes` interface; the key must then flow into
 * the context's `classes`, the `classes` / `reclass` props, and schema entries.
 * Validated by `pnpm tsc:types`.
 */
import { defineSchema, type ClassValue, type ContextOf } from '@vueform/core'
import '@vueform/core/components'
import type { VfTextProps } from '@vueform/core/components/VfText'

declare module '@vueform/core/components/VfText' {
  interface VfTextClasses {
    augmentedIcon: ClassValue
  }
}

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type IsAny<T> = 0 extends 1 & T ? true : false

type TextContext = ContextOf<'VfText'>

// The augmented key is typed on the context — not the `any` fallback.
type _augmentedOnContext = Expect<IsAny<TextContext['classes']['augmentedIcon']> extends false ? true : false>
type _augmentedIsClassValue = Expect<Equal<TextContext['classes']['augmentedIcon'], ClassValue>>
// Declared keys are unaffected.
type _inputStillTyped = Expect<Equal<TextContext['classes']['input'], ClassValue>>

// The `classes` / `reclass` props know the key.
type _classesPropHasKey = Expect<'augmentedIcon' extends keyof NonNullable<VfTextProps['classes']> ? true : false>
type _reclassPropHasKey = Expect<'augmentedIcon' extends keyof NonNullable<VfTextProps['reclass']> ? true : false>

// Schema entries accept it (contextual form included).
defineSchema({
  email: {
    type: 'text',
    classes: { augmentedIcon: 'text-gray-400' },
    reclass: { augmentedIcon: (el$) => (el$.hasError ? 'red' : 'gray') },
  },
})
