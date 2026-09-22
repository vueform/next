/*
 * Compile-time assertions for `context.outlets` typing on the public context:
 * outlet values keep their slot payload types (not `any`), and the SFC's
 * narrow slots remain assignable to the canonical bivariant outlets.
 * Validated by `pnpm tsc:types`.
 */
import type { ContextOf, ContextOutlets } from '@vueform/core'
import '@vueform/core/components'
import type { VNode } from 'vue'

type Expect<T extends true> = T
type IsAny<T> = 0 extends 1 & T ? true : false
type IsUnknown<T> = unknown extends T ? (IsAny<T> extends true ? false : true) : false

type TextOutlets = ContextOf<'VfText'>['outlets']

// Outlet values are typed slot callbacks, not `any`.
type _addonBeforeNotAny = Expect<IsAny<NonNullable<TextOutlets['addonBefore']>> extends false ? true : false>
type _addonBeforeIsFn = Expect<NonNullable<TextOutlets['addonBefore']> extends (...args: any[]) => any ? true : false>

// The payload keeps its declared shape.
type _addonBeforePayload = Expect<
  Parameters<NonNullable<TextOutlets['addonBefore']>>[0] extends {
    addonBefore: unknown
  }
    ? true
    : false
>

// Unknown outlet names stay rejected.
// @ts-expect-error - not a declared VfText slot
type _unknown = TextOutlets['notASlot']

// ContextOutlets widening rule: only the `context` member of a
// context-carrying slot's payload is widened to `any`; the rest of its
// signature, and zero-arg / empty-payload slots, stay typed.
type SampleOutlets = ContextOutlets<{
  bare: () => VNode[]
  emptyPayload: (props: {}) => VNode[]
  payload: (props: { label?: string }) => VNode[]
  contextual: (props: { context: { value: string } }) => VNode[]
  contextualMixed: (props: { context: { value: string }; label: string }) => VNode[]
}>

type _bareStaysTyped = Expect<IsAny<NonNullable<SampleOutlets['bare']>> extends false ? true : false>
type _bareIsFn = Expect<NonNullable<SampleOutlets['bare']> extends () => VNode[] ? true : false>
type _emptyPayloadStaysTyped = Expect<IsAny<NonNullable<SampleOutlets['emptyPayload']>> extends false ? true : false>
type _payloadStaysTyped = Expect<
  Parameters<NonNullable<SampleOutlets['payload']>>[0] extends {
    label?: string
  }
    ? true
    : false
>
type _contextualStaysFn = Expect<IsAny<NonNullable<SampleOutlets['contextual']>> extends false ? true : false>
type _contextualReturnKept = Expect<ReturnType<NonNullable<SampleOutlets['contextual']>> extends VNode[] ? true : false>
type _contextualContextWidened = Expect<IsUnknown<Parameters<NonNullable<SampleOutlets['contextual']>>[0]['context']>>
type _contextualMixedLabelKept = Expect<Parameters<NonNullable<SampleOutlets['contextualMixed']>>[0]['label'] extends string ? true : false>
