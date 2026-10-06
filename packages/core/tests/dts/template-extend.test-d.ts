/*
 * Type-level tests for the "Extending a Template" docs section: the
 * augmentations a template ships next to a plugin (props, emits, expose,
 * parts) must flow into the context a template receives (`ContextOf`), the
 * component's props, and `fire`. Run by `pnpm test:dts`.
 */
import {
  defineSchema,
  type ContextOf,
  type DomAttrsOf,
  type LanguagesProp,
  type UnwrapTopLevelRef,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import type {
  VfTextContext,
  VfTextProps,
} from '@vueform/core/components/VfText'
import type { ComputedRef } from 'vue'
import '@vueform/core/components'

// Module augmentations must stay at the top level of the file.
declare module '@vueform/core/components/VfText' {
  // The type params must mirror the original declaration (interface merging
  // requires identical type parameter lists), even though this member ignores
  // them.

  interface VfTextProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  > {
    extPrefix?: string
  }

  interface VfTextEmits<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  > {
    extPrefixClick: [
      e: MouseEvent,
      context$: VfTextContext<VfTextProps<TTranslate, TLanguages>>,
    ]
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

type TextContext = ContextOf<'VfText'>

declare const ctx: TextContext

describe('template augmentation (VfText)', () => {
  test("props: readable from `context.props`, accepted by the component's props", () => {
    expectTypeOf<TextContext['props']['extPrefix']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<VfTextProps>().toHaveProperty('extPrefix')
  })

  test('expose: present on the public context', () => {
    // A required `ComputedRef` member (the documented form) unwraps to its
    // value there; this one is optional (see the augmentation), and
    // `T | undefined` is not unwrapped — hence the shape below.
    expectTypeOf<TextContext['extReversed']>().toEqualTypeOf<
      ComputedRef<string> | undefined
    >()
    expectTypeOf<
      UnwrapTopLevelRef<ComputedRef<string>>
    >().toEqualTypeOf<string>()
  })

  test("parts: typed on the context's parts bag and on the `parts` prop", () => {
    expectTypeOf<TextContext['parts']>().toHaveProperty('extIcon')
    expectTypeOf<NonNullable<VfTextProps['parts']>>().toHaveProperty('extIcon')
  })

  test('emits: `fire` accepts the augmented event with its tuple', () => {
    ctx.fire('extPrefixClick', new MouseEvent('click'), ctx)
    // @ts-expect-error — wrong payload type
    ctx.fire('extPrefixClick', 'not-an-event', ctx)
  })

  test('schema entries accept the prop', () => {
    defineSchema({
      amount: { type: 'text', extPrefix: '$' },
    })
  })
})
