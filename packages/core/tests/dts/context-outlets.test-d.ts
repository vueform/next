/*
 * Type-level tests for `context.outlets` typing on the public context:
 * outlet values keep their slot payload types (not `any`), and the SFC's
 * narrow slots remain assignable to the canonical bivariant outlets.
 * Run by `pnpm test:dts`.
 */
import { describe, expectTypeOf, test } from 'vitest'
import type { ContextOf, ContextOutlets } from '@vueform/core'
import '@vueform/core/components'
import type { VNode } from 'vue'

type TextOutlets = ContextOf<'VfText'>['outlets']

describe('context.outlets on the public context', () => {
  test('outlet values are typed slot callbacks, not `any`', () => {
    expectTypeOf<NonNullable<TextOutlets['addonBefore']>>().not.toBeAny()
    expectTypeOf<NonNullable<TextOutlets['addonBefore']>>().toExtend<(...args: any[]) => any>()
  })

  test('the payload keeps its declared shape', () => {
    expectTypeOf<Parameters<NonNullable<TextOutlets['addonBefore']>>[0]>().toExtend<{
      addonBefore: unknown
    }>()
  })

  test('unknown outlet names stay rejected', () => {
    // @ts-expect-error - not a declared VfText slot
    type _unknown = TextOutlets['notASlot']
  })
})

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

describe('ContextOutlets widening rule', () => {
  test('zero-arg / empty-payload slots stay typed', () => {
    expectTypeOf<NonNullable<SampleOutlets['bare']>>().not.toBeAny()
    expectTypeOf<NonNullable<SampleOutlets['bare']>>().toExtend<() => VNode[]>()
    expectTypeOf<NonNullable<SampleOutlets['emptyPayload']>>().not.toBeAny()
  })

  test('non-context payload members stay typed', () => {
    expectTypeOf<Parameters<NonNullable<SampleOutlets['payload']>>[0]>().toExtend<{
      label?: string
    }>()
  })

  test('only the `context` member is widened; the rest of the signature is kept', () => {
    expectTypeOf<NonNullable<SampleOutlets['contextual']>>().not.toBeAny()
    expectTypeOf<ReturnType<NonNullable<SampleOutlets['contextual']>>>().toExtend<VNode[]>()
    expectTypeOf<Parameters<NonNullable<SampleOutlets['contextual']>>[0]['context']>().toBeUnknown()
    expectTypeOf<Parameters<NonNullable<SampleOutlets['contextualMixed']>>[0]['label']>().toExtend<string>()
  })
})
