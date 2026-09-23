/*
 * Compile-time assertions for VfSelect / select typing in schema.
 * SFC cases live in select-context.vue. Validated by `pnpm tsc:types`.
 *
 * Covers:
 * - items / modelValue / default / multiple generics
 * - contextual props (e.g. label) receive VfSelectContext
 * - event handlers receive VfSelectContext
 * - classes / parts / reclass object forms receive VfSelectContext
 * - class:* / reclass:* / part:* attrs are dist-only (see shorthand-attrs-dist.ts)
 */
import { defineSchema, type ComponentRegistry, type ContextOf, type ExpressionString, type SchemaEntryOf } from '@vueform/core'
import '@vueform/core/components'
import type { VfSelectContext, VfSelectEmits, VfSelectExpose, VfSelectProps, VfSelectSlots } from '@vueform/core/components/VfSelect'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type IsAny<T> = 0 extends 1 & T ? true : false
type HasKey<T, K extends string> = K extends keyof T ? true : false
type MutuallyAssignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

type VfSelectDefinition = ComponentRegistry['VfSelect']
type VfSelectSchemaEntry = SchemaEntryOf<'VfSelect'>
type ObjectItems = [{ id: 1; label: 'A'; foo: () => void }, { id: 2; label: 'B'; foo: () => void }]

// ---------------------------------------------------------------------------
// Expose — factory API lives on VfSelectExpose; context unwraps its refs
// ---------------------------------------------------------------------------

type SelectContext = ContextOf<'VfSelect'>
// Every Expose key appears on the public context (values may be unwrapped).
type _exposeKeysOnContext = Expect<keyof VfSelectExpose extends keyof SelectContext ? true : false>
type _exposeKeysOnEntryContext = Expect<keyof VfSelectExpose extends keyof VfSelectDefinition['context'] ? true : false>

type _propsNotAny = Expect<IsAny<SelectContext['props']> extends false ? true : false>
type _propsHasMultiple = Expect<HasKey<SelectContext['props'], 'multiple'>>
type _propsHasItems = Expect<HasKey<SelectContext['props'], 'items'>>
type _outletsNotAny = Expect<IsAny<SelectContext['outlets']> extends false ? true : false>
type _outletsHasTemplate = Expect<HasKey<SelectContext['outlets'], 'template'>>
type _partsHasInput = Expect<HasKey<SelectContext['parts'], 'input'>>
type _classesHasInput = Expect<HasKey<SelectContext['classes'], 'input'>>
// Undeclared keys resolve at runtime (lazy proxy) — templates may read keys
// they registered via `useClasses`, so the context must not reject them.
type _classesAllowsUnknownKey = Expect<IsAny<SelectContext['classes']['customIcon']>>
type _eventsHasFire = Expect<HasKey<SelectContext, 'fire'>>
type _eventsHasOn = Expect<HasKey<SelectContext, 'on'>>
type _eventsHasOff = Expect<HasKey<SelectContext, 'off'>>
type _eventsHasOnBefore = Expect<HasKey<SelectContext, 'onBefore'>>
type _eventsHasOnAfter = Expect<HasKey<SelectContext, 'onAfter'>>
type _eventsHasFireAsync = Expect<HasKey<SelectContext, 'fireAsync'>>
type _eventsHasHasListeners = Expect<HasKey<SelectContext, 'hasListeners'>>
type _hasConfig = Expect<HasKey<SelectContext, '$config'>>
type _hasLocale = Expect<HasKey<SelectContext, '$locale'>>
type _hasGlobals = Expect<HasKey<SelectContext, '$globals'>>
type _localeHasSet = Expect<HasKey<SelectContext['$locale'], 'set'>>
type _configHasModules = Expect<HasKey<SelectContext['$config'], 'modules'>>
type _globalsHasBreakpoint = Expect<HasKey<SelectContext['$globals'], 'defaultBreakpoint'>>

// ---------------------------------------------------------------------------
// Generics — props (type-level) + schema defineSchema checks
// ---------------------------------------------------------------------------

type ExactProps = VfSelectProps<ObjectItems, 'id'>
type ExactMultiProps = VfSelectProps<ObjectItems, 'id', undefined, true>

type _modelIsId = Expect<NonNullable<ExactProps['modelValue']> extends 1 | 2 | null ? true : false>
type _defaultIsId = Expect<NonNullable<ExactProps['default']> extends 1 | 2 | null | ExpressionString ? true : false>
type _multiModelIsArray = Expect<NonNullable<ExactMultiProps['modelValue']> extends (1 | 2)[] ? true : false>

defineSchema({
  modelOk: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    modelValue: 1,
    default: 2,
  },
  modelBad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    // @ts-expect-error string model with numeric itemValue
    modelValue: 'A',
  },
  defaultBad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    // @ts-expect-error string default with numeric itemValue
    default: 'A',
  },
  multipleOk: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    multiple: true,
    modelValue: [1, 2],
    default: [1],
  },
  multipleBad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    multiple: true,
    // @ts-expect-error single value when multiple
    modelValue: 1,
  },
})

// ---------------------------------------------------------------------------
// Contextual props (label) — schema + definition extraction
// ---------------------------------------------------------------------------

type SchemaLabel = NonNullable<VfSelectSchemaEntry['label']>
type SchemaLabelFn = Extract<SchemaLabel, (...args: any[]) => any>
type SchemaLabelContext = Parameters<SchemaLabelFn>[0]

type _labelContextIsSelect = Expect<MutuallyAssignable<SchemaLabelContext, VfSelectContext>>
type _labelContextHasPath = Expect<HasKey<SchemaLabelContext, 'path'>>
type _labelContextNotAny = Expect<IsAny<SchemaLabelContext> extends false ? true : false>

// Narrowed props pin contextual props to the narrowed context (invariant via
// the callback parameter), so it matches `VfSelectContext<ExactProps>`, not
// the wide `VfSelectContext`.
type ExactLabelFn = Extract<NonNullable<ExactProps['label']>, (...args: any[]) => any>
type ExactLabelContext = Parameters<ExactLabelFn>[0]
type _exactLabelContextIsSelect = Expect<MutuallyAssignable<ExactLabelContext, VfSelectContext<ExactProps>>>
type _exactLabelContextModel = Expect<Equal<ExactLabelContext['model'], 1 | 2 | null>>

defineSchema({
  labelOk: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    label: (el$) => {
      el$.path
      el$.validate
      el$.form$
      el$.items
      el$.model
      return `${el$.path}`
    },
  },
  labelBad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    // @ts-expect-error invalid context member
    label: (el$) => el$.definitelyNotARealMember,
  },
})

// ---------------------------------------------------------------------------
// Event handlers — schema + definition extraction
// ---------------------------------------------------------------------------

type SchemaOnChange = NonNullable<VfSelectSchemaEntry['onChange']>
type SchemaEventContext = Parameters<SchemaOnChange>[2]

type _eventContextIsSelect = Expect<MutuallyAssignable<SchemaEventContext, VfSelectContext>>
type _eventContextHasPath = Expect<HasKey<SchemaEventContext, 'path'>>
type _eventContextHasItems = Expect<HasKey<SchemaEventContext, 'items'>>
type _eventContextNotAny = Expect<IsAny<SchemaEventContext> extends false ? true : false>

type EventsChangeContext = VfSelectEmits['change'][2]
type _eventsChangeIsSelect = Expect<MutuallyAssignable<EventsChangeContext, VfSelectContext>>

defineSchema({
  changeOk: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    onChange(_n, _o, el$) {
      el$.path
      el$.validate
      el$.form$
      el$.items
      el$.model
    },
  },
  changeBad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    // @ts-expect-error invalid context member
    onChange: (_n, _o, el$) => el$.definitelyNotARealMember,
  },
})

// ---------------------------------------------------------------------------
// Slots — definition extraction (SFC usage in .vue)
// ---------------------------------------------------------------------------

// The #template slot payload is a single `context` prop. Default (bare)
// generics keep the ContextOf shape; concrete generics refine model / items.
type SlotContext = Parameters<VfSelectSlots['template']>[0]['context']
type _slotContextHasPath = Expect<HasKey<SlotContext, 'path'>>
type _slotContextHasModel = Expect<HasKey<SlotContext, 'model'>>
type _slotContextHasItems = Expect<HasKey<SlotContext, 'items'>>
type _slotContextHasProps = Expect<HasKey<SlotContext, 'props'>>

type ScalarMultiSlots = VfSelectSlots<[1, 2, 3], undefined, undefined, true>
type ScalarMultiSlotContext = Parameters<ScalarMultiSlots['template']>[0]['context']
type _scalarMultiModel = Expect<Equal<ScalarMultiSlotContext['model'], (1 | 2 | 3)[]>>
type _scalarMultiPropsMultiple = Expect<true extends NonNullable<ScalarMultiSlotContext['props']['multiple']> ? true : false>
type _scalarMultiPropsItems = Expect<[1, 2, 3] extends NonNullable<ScalarMultiSlotContext['props']['items']> ? true : false>
type _scalarMultiItemValue = Expect<Equal<ScalarMultiSlotContext['items'][number]['value'], 1 | 2 | 3>>

type ObjectSlots = VfSelectSlots<ObjectItems, 'id'>
type ObjectSlotContext = Parameters<ObjectSlots['template']>[0]['context']
type _objectModel = Expect<Equal<ObjectSlotContext['model'], 1 | 2 | null>>
type _objectItemValue = Expect<Equal<ObjectSlotContext['items'][number]['value'], 1 | 2>>

type ObjectMultiSlots = VfSelectSlots<ObjectItems, 'id', undefined, true>
type ObjectMultiSlotContext = Parameters<ObjectMultiSlots['template']>[0]['context']
type _objectMultiModel = Expect<Equal<ObjectMultiSlotContext['model'], (1 | 2)[]>>

// ---------------------------------------------------------------------------
// classes / parts / class:* / reclass:* / part:* — schema + extraction
// ---------------------------------------------------------------------------

type SchemaClassesInput = NonNullable<NonNullable<VfSelectSchemaEntry['classes']>['input']>
type SchemaClassesFn = Extract<SchemaClassesInput, (...args: any[]) => any>
type SchemaClassesContext = Parameters<SchemaClassesFn>[0]
type _classesContextIsSelect = Expect<MutuallyAssignable<SchemaClassesContext, VfSelectContext>>

type SchemaReclassInput = NonNullable<NonNullable<VfSelectSchemaEntry['reclass']>['input']>
type SchemaReclassFn = Extract<SchemaReclassInput, (...args: any[]) => any>
type SchemaReclassContext = Parameters<SchemaReclassFn>[0]
type _reclassContextIsSelect = Expect<MutuallyAssignable<SchemaReclassContext, VfSelectContext>>

type SchemaPartsInput = NonNullable<NonNullable<VfSelectSchemaEntry['parts']>['input']>
type SchemaPartsFn = Extract<SchemaPartsInput, (...args: any[]) => any>
type SchemaPartsContext = Parameters<SchemaPartsFn>[0]
type _partsContextIsSelect = Expect<MutuallyAssignable<SchemaPartsContext, VfSelectContext>>

// `part:*` / `class:*` / `reclass:*` attr keys are injected into dist only
// (see `#shorthands` + vf-build). Asserted in `shorthand-attrs-dist.ts`.

defineSchema({
  classesPartsOk: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    classes: {
      input: (el$) => (el$.path ? 'ok' : ''),
    },
    reclass: {
      input: (el$) => (el$.path ? 'ok' : ''),
    },
    parts: {
      input: (el$) => ({ 'data-path': el$.path }),
    },
  },
  classesBad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    classes: {
      // @ts-expect-error invalid context member
      input: (el$) => el$.definitelyNotARealMember,
    },
  },
  partsBad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    parts: {
      // @ts-expect-error invalid context member
      input: (el$) => ({ x: el$.definitelyNotARealMember }),
    },
  },
  reclassBad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    reclass: {
      // @ts-expect-error invalid context member
      input: (el$) => el$.definitelyNotARealMember,
    },
  },
})
