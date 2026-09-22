/*
 * Compile-time assertions for VfField's `nullValue`-driven model / value
 * typing. `nullValue` always types ONE value — the model itself when not
 * translating, each language's entry when `translate: true` — and literal
 * shapes widen to their kind (`FieldNullValue` in blueprints/field.ts):
 *
 * - `null` / omitted — the model is `any`
 * - string / number / boolean literals — the primitive
 * - arrays — `any[]`, regardless of the declared members: an array `nullValue`
 *   only says "the model is an array"
 * - objects — the shape with every key optional; a provided key must match its
 *   declared (widened) property type
 *
 * Validated by `pnpm tsc:types`.
 */
import { defineSchema, type ContextOf, type SlotProps, type LanguagesProp } from '@vueform/core'
import type { VfFieldContext, VfFieldProps } from '@vueform/core/components/VfField'
import '@vueform/core/components'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type IsAny<T> = 0 extends 1 & T ? true : false
// `model` carries a `NoInfer` wrapper (mutually assignable with its base but
// not `Equal`-identical), so model assertions check assignability both ways.
type Mutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

// ---------------------------------------------------------------------------
// Widening rules — entry `nullValue` → context `value` / `model`
// ---------------------------------------------------------------------------

// No nullValue: undeclared shape stays unconstrained
type NoneCtx = ContextOf<'VfField', {}>
type _noneValue = Expect<IsAny<NoneCtx['value']>>
type _noneModel = Expect<IsAny<NoneCtx['model']>>

// nullValue: null — same as undeclared
type NullCtx = ContextOf<'VfField', { nullValue: null }>
type _nullValue = Expect<IsAny<NullCtx['value']>>

// Number / string / boolean literals widen to their primitives
type NumCtx = ContextOf<'VfField', { nullValue: 0 }>
type _numValue = Expect<Equal<NumCtx['value'], number>>
type _numModel = Expect<Mutual<NumCtx['model'], number>>

type StrCtx = ContextOf<'VfField', { nullValue: '' }>
type _strValue = Expect<Equal<StrCtx['value'], string>>

type BoolCtx = ContextOf<'VfField', { nullValue: false }>
type _boolValue = Expect<Equal<BoolCtx['value'], boolean>>

// Any array — empty, literal tuple, or typed — declares an unrestricted array
type EmptyArrCtx = ContextOf<'VfField', { nullValue: readonly [] }>
type _emptyArrValue = Expect<Equal<EmptyArrCtx['value'], any[]>>

type TupleCtx = ContextOf<'VfField', { nullValue: readonly ['1234', 'asdf'] }>
type _tupleValue = Expect<Equal<TupleCtx['value'], any[]>>

type TypedArrCtx = ContextOf<'VfField', { nullValue: string[] }>
type _typedArrValue = Expect<Equal<TypedArrCtx['value'], any[]>>

// Objects keep their shape — properties widened, optional, readonly dropped
type ObjCtx = ContextOf<'VfField', { nullValue: { readonly lat: 0; readonly lng: 0 } }>
type _objValue = Expect<Equal<ObjCtx['value'], { lat?: number; lng?: number }>>

// ...recursively, through nested arrays and objects
type DeepCtx = ContextOf<'VfField', { nullValue: { readonly tags: readonly ['x']; readonly meta: { readonly count: 0 } } }>
type _deepValue = Expect<Equal<DeepCtx['value'], { tags?: any[]; meta?: { count?: number } }>>

// ---------------------------------------------------------------------------
// defineSchema — nullValue + modelValue / default acceptance
// ---------------------------------------------------------------------------

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
  mixedIntoStrArr: { type: 'field', nullValue: ['1234', 'asdf'], modelValue: [1, true] },
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

// ---------------------------------------------------------------------------
// translate: true — nullValue types each language's entry
// ---------------------------------------------------------------------------

// Without nullValue the per-language scalar defaults to the text scalar
type TransDefaultCtx = ContextOf<'VfField', { translate: true; languages: { en: 'English'; de: 'German' } }>
type _transDefaultValue = Expect<Equal<TransDefaultCtx['value'], string | number | null>>

// With a scalar nullValue, the entry (and the value) follow it
type TransStrCtx = ContextOf<'VfField', { translate: true; languages: { en: 'English'; de: 'German' }; nullValue: '' }>
type _transStrValue = Expect<Equal<TransStrCtx['value'], string>>
type _transStrModel = Expect<Mutual<TransStrCtx['model'], { en: string; de: string }>>

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

// ---------------------------------------------------------------------------
// Wide surfaces stay permissive (defineSlot / template refs without generics)
// ---------------------------------------------------------------------------

type WideSlotValue = SlotProps['VfField']['default']['context']['value']
type _wideSlotValue = Expect<IsAny<WideSlotValue>>

type _wideCtxValue = Expect<IsAny<VfFieldContext['value']>>

// ---------------------------------------------------------------------------
// SFC generic path (what :null-value / :translate infer in templates)
// ---------------------------------------------------------------------------

// `:null-value="[]"` infers `never[]` in templates → any[]
type SfcEmpty = VfFieldContext<VfFieldProps<false, LanguagesProp, never[]>>
type _sfcEmptyValue = Expect<Equal<SfcEmpty['value'], any[]>>

type SfcCoords = VfFieldContext<VfFieldProps<false, LanguagesProp, { lat: number; lng: number }>>
type _sfcCoordsValue = Expect<Equal<SfcCoords['value'], { lat?: number; lng?: number }>>

type SfcTrans = VfFieldContext<VfFieldProps<true, { en: 'English' }, string | null>>
type _sfcTransValue = Expect<Equal<SfcTrans['value'], string | null>>

// The slot can call array/model methods on a narrowed value
declare const tags$: ContextOf<'VfField', { nullValue: readonly ['1234', 'asdf'] }>
tags$.value.includes('123')
tags$.update(['a', 'b'])
tags$.update(tags$.value.filter((t) => t !== 'a'))
