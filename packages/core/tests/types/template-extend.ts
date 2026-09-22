/*
 * Compile-time assertions for the "Extending a Template" docs section: the
 * augmentations a template ships next to a plugin (props, emits, expose,
 * parts) must flow into the context a template receives (`ContextOf`), the
 * component's props, and `fire`. Validated by `pnpm tsc:types`.
 */
import { defineSchema, type ContextOf, type DomAttrsOf, type LanguagesProp, type UnwrapTopLevelRef } from '@vueform/core'
import type { VfTextContext, VfTextProps } from '@vueform/core/components/VfText'
import type { ComputedRef } from 'vue'
import '@vueform/core/components'

declare module '@vueform/core/components/VfText' {
  interface VfTextProps<TTranslate extends boolean = boolean, TLanguages extends LanguagesProp = LanguagesProp> {
    extPrefix?: string
  }

  interface VfTextEmits<TTranslate extends boolean = boolean, TLanguages extends LanguagesProp = LanguagesProp> {
    extPrefixClick: [e: MouseEvent, context$: VfTextContext<VfTextProps<TTranslate, TLanguages>>]
  }

  interface VfTextExpose {
    // Optional only because this program includes the VfText SFC source, whose
    // own `:context` binding would otherwise miss the member. Apps compile
    // against dist types and can declare it required, as the docs do.
    extReversed?: ComputedRef<string>
  }

  interface VfTextParts {
    extIcon: DomAttrsOf<'span'>
  }
}

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

type TextContext = ContextOf<'VfText'>

// Props: readable from `context.props`, accepted by the component's props.
type _propOnContext = Expect<Equal<TextContext['props']['extPrefix'], string | undefined>>
type _propOnProps = Expect<'extPrefix' extends keyof VfTextProps ? true : false>

// Expose: present on the public context. A required `ComputedRef` member (the
// documented form) unwraps to its value there; this one is optional (see the
// augmentation), and `T | undefined` is not unwrapped — hence the shape below.
type _exposeOnContext = Expect<Equal<TextContext['extReversed'], ComputedRef<string> | undefined>>
type _requiredExposeUnwraps = Expect<Equal<UnwrapTopLevelRef<ComputedRef<string>>, string>>

// Parts: typed on the context's parts bag and on the `parts` prop.
type _partOnContext = Expect<'extIcon' extends keyof TextContext['parts'] ? true : false>
type _partOnProps = Expect<'extIcon' extends keyof NonNullable<VfTextProps['parts']> ? true : false>

// Emits: `fire` accepts the augmented event with its tuple.
declare const ctx: TextContext
ctx.fire('extPrefixClick', new MouseEvent('click'), ctx)
// @ts-expect-error — wrong payload type
ctx.fire('extPrefixClick', 'not-an-event', ctx)

// Schema entries accept the prop.
defineSchema({
  amount: { type: 'text', extPrefix: '$' },
})
