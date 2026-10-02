/*
 * Type-level tests for VfField's `nullValue`-driven model / value typing.
 * `nullValue` always types ONE value — the model itself when not translating,
 * each language's entry when `translate: true` — and literal shapes widen to
 * their kind (`FieldNullValue` in blueprints/field.ts):
 *
 * - `null` / omitted — the model is `any`
 * - string / number / boolean literals — the primitive
 * - arrays — `any[]`, regardless of the declared members: an array `nullValue`
 *   only says "the model is an array"
 * - objects — the shape with every key optional; a provided key must match its
 *   declared (widened) property type
 *
 * Run by `pnpm test:dts`.
 */
import { defineSchema, type ContextOf, type LanguagesProp, type SlotProps } from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import type { VfFieldContext, VfFieldProps } from '@vueform/core/components/VfField'
import '@vueform/core/components'

// `model` carries a `NoInfer` wrapper (mutually assignable with its base but
// not `Equal`-identical), so model assertions check assignability both ways.

// Fixture for the narrowed-slot test below — type-test files are typechecked,
// never executed.
declare const tags$: ContextOf<'VfField', { nullValue: readonly ['1234', 'asdf'] }>

describe('widening rules — entry nullValue → context value / model', () => {
  test('no nullValue: undeclared shape stays unconstrained', () => {
    type NoneCtx = ContextOf<'VfField', {}>

    expectTypeOf<NoneCtx['value']>().toBeAny()
    expectTypeOf<NoneCtx['model']>().toBeAny()
  })

  test('nullValue: null — same as undeclared', () => {
    type NullCtx = ContextOf<'VfField', { nullValue: null }>

    expectTypeOf<NullCtx['value']>().toBeAny()
  })

  test('number / string / boolean literals widen to their primitives', () => {
    type NumCtx = ContextOf<'VfField', { nullValue: 0 }>

    expectTypeOf<NumCtx['value']>().toEqualTypeOf<number>()
    expectTypeOf<NumCtx['model']>().toExtend<number>()
    expectTypeOf<number>().toExtend<NumCtx['model']>()

    type StrCtx = ContextOf<'VfField', { nullValue: '' }>

    expectTypeOf<StrCtx['value']>().toEqualTypeOf<string>()

    type BoolCtx = ContextOf<'VfField', { nullValue: false }>

    expectTypeOf<BoolCtx['value']>().toEqualTypeOf<boolean>()
  })

  test('any array — empty, literal tuple, or typed — declares an unrestricted array', () => {
    type EmptyArrCtx = ContextOf<'VfField', { nullValue: readonly [] }>

    expectTypeOf<EmptyArrCtx['value']>().toEqualTypeOf<any[]>()

    type TupleCtx = ContextOf<'VfField', { nullValue: readonly ['1234', 'asdf'] }>

    expectTypeOf<TupleCtx['value']>().toEqualTypeOf<any[]>()

    type TypedArrCtx = ContextOf<'VfField', { nullValue: string[] }>

    expectTypeOf<TypedArrCtx['value']>().toEqualTypeOf<any[]>()
  })

  test('objects keep their shape — properties widened, optional, readonly dropped', () => {
    type ObjCtx = ContextOf<'VfField', { nullValue: { readonly lat: 0; readonly lng: 0 } }>

    expectTypeOf<ObjCtx['value']>().toEqualTypeOf<{
      lat?: number
      lng?: number
    }>()

    // ...recursively, through nested arrays and objects
    type DeepCtx = ContextOf<
      'VfField',
      {
        nullValue: {
          readonly tags: readonly ['x']
          readonly meta: { readonly count: 0 }
        }
      }
    >

    expectTypeOf<DeepCtx['value']>().toEqualTypeOf<{
      tags?: any[]
      meta?: { count?: number }
    }>()
  })
})

describe('defineSchema — nullValue + modelValue / default acceptance', () => {
  test('accepts models matching the declared (widened) nullValue', () => {
    defineSchema({
      // no nullValue / null nullValue: any model
      anything: { type: 'field', modelValue: [123, 'dafs', true] },
      anyObj: { type: 'field', nullValue: null, modelValue: { deep: [1] } },

      // primitives
      num: { type: 'field', nullValue: 0, modelValue: 42, default: 7 },
      str: { type: 'field', nullValue: '', modelValue: 'hello' },
      bool: { type: 'field', nullValue: false, modelValue: true },

      // arrays — the members never restrict the model, only that it's an array
      emptyArr: { type: 'field', nullValue: [], modelValue: [1, 'mixed', true] },
      strArr: { type: 'field', nullValue: ['1234', 'asdf'], modelValue: ['123'] },
      mixedIntoStrArr: {
        type: 'field',
        nullValue: ['1234', 'asdf'],
        modelValue: [1, true],
      },
      typedArr: { type: 'field', nullValue: [] as string[], modelValue: ['a', 1] },

      // objects — keys are optional; provided keys must match the widened shape
      obj: {
        type: 'field',
        nullValue: { lat: 0, lng: 0 },
        modelValue: { lat: 1.2, lng: 3.4 },
      },
      objPartial: {
        type: 'field',
        nullValue: { lat: 0, lng: 0 },
        modelValue: { lat: 1.2 },
      },
      objEmpty: {
        type: 'field',
        nullValue: { lat: 0, lng: 0 },
        modelValue: {},
      },
      deepObj: {
        type: 'field',
        nullValue: { tags: ['x'], meta: { count: 0 } },
        modelValue: { tags: ['a', 1], meta: {} },
      },
    })
  })

  test('rejects models that do not fit the declared nullValue', () => {
    defineSchema({
      numBad: {
        type: 'field',
        nullValue: 0,
        // @ts-expect-error — string doesn't fit a number model
        modelValue: 'nope',
      },
    })

    defineSchema({
      numBadDefault: {
        type: 'field',
        nullValue: 0,
        // @ts-expect-error — string doesn't fit a number model
        default: 'nope',
      },
    })

    defineSchema({
      arrBad: {
        type: 'field',
        nullValue: ['1234', 'asdf'],
        // @ts-expect-error — a non-array doesn't fit an array model
        modelValue: 'nope',
      },
    })

    defineSchema({
      objBadKey: {
        type: 'field',
        nullValue: { lat: 0, lng: 0 },
        // @ts-expect-error — wrong object shape
        modelValue: { latitude: 1 },
      },
    })

    defineSchema({
      objBadValue: {
        type: 'field',
        nullValue: { lat: 0, lng: 0 },
        // @ts-expect-error — string doesn't fit a number property
        modelValue: { lat: 'north', lng: 3.4 },
      },
    })
  })
})

describe('translate: true — nullValue types each language entry', () => {
  test('without nullValue the per-language scalar defaults to the text scalar', () => {
    type TransDefaultCtx = ContextOf<'VfField', { translate: true; languages: { en: 'English'; de: 'German' } }>

    expectTypeOf<TransDefaultCtx['value']>().toEqualTypeOf<string | number | null>()
  })

  test('with a scalar nullValue, the entry (and the value) follow it', () => {
    type TransStrCtx = ContextOf<
      'VfField',
      {
        translate: true
        languages: { en: 'English'; de: 'German' }
        nullValue: ''
      }
    >

    expectTypeOf<TransStrCtx['value']>().toEqualTypeOf<string>()
    expectTypeOf<TransStrCtx['model']>().toExtend<{ en: string; de: string }>()
    expectTypeOf<{ en: string; de: string }>().toExtend<TransStrCtx['model']>()
  })

  test('defineSchema checks per-language entries against nullValue', () => {
    defineSchema({
      bio: {
        type: 'field',
        translate: true,
        languages: { en: 'English', de: 'German' },
        nullValue: '',
        modelValue: { en: 'hi' },
      },
    })

    defineSchema({
      bioBad: {
        type: 'field',
        translate: true,
        languages: { en: 'English', de: 'German' },
        nullValue: '',
        // @ts-expect-error — number doesn't fit a per-language string entry
        modelValue: { en: 5 },
      },
    })
  })
})

describe('wide surfaces stay permissive (defineSlot / template refs without generics)', () => {
  test('slot props and bare context keep value as any', () => {
    type WideSlotValue = SlotProps['VfField']['default']['context']['value']

    expectTypeOf<WideSlotValue>().toBeAny()
    expectTypeOf<VfFieldContext['value']>().toBeAny()
  })
})

describe('SFC generic path (what :null-value / :translate infer in templates)', () => {
  test(':null-value generics widen like schema nullValue', () => {
    // `:null-value="[]"` infers `never[]` in templates → any[]
    type SfcEmpty = VfFieldContext<VfFieldProps<false, LanguagesProp, never[]>>

    expectTypeOf<SfcEmpty['value']>().toEqualTypeOf<any[]>()

    type SfcCoords = VfFieldContext<VfFieldProps<false, LanguagesProp, { lat: number; lng: number }>>

    expectTypeOf<SfcCoords['value']>().toEqualTypeOf<{
      lat?: number
      lng?: number
    }>()

    type SfcTrans = VfFieldContext<VfFieldProps<true, { en: 'English' }, string | null>>

    expectTypeOf<SfcTrans['value']>().toEqualTypeOf<string | null>()
  })

  test('the slot can call array/model methods on a narrowed value', () => {
    tags$.value.includes('123')
    tags$.update(['a', 'b'])
    tags$.update(tags$.value.filter((t) => t !== 'a'))
  })
})
