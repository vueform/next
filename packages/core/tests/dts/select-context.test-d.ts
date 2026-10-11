/*
 * Type-level tests for VfSelect / select typing in schema.
 * SFC cases live in select-context.vue. Run by `pnpm test-dts`.
 *
 * Covers:
 * - items / modelValue / default / multiple generics
 * - contextual props (e.g. label) receive VfSelectContext
 * - event handlers receive VfSelectContext
 * - classes / parts / reclass object forms receive VfSelectContext
 * - class:* / reclass:* / part:* attrs are dist-only (see shorthand-attrs-dist.test-d.ts)
 */
import {
  defineSchema,
  type ComponentRegistry,
  type ContextOf,
  type ExpressionString,
  type SchemaEntryOf,
} from '@vueform/core'
import type {
  VfSelectContext,
  VfSelectEmits,
  VfSelectExpose,
  VfSelectProps,
  VfSelectSlots,
} from '@vueform/core/components/VfSelect'
import '@vueform/core/components'
import { describe, expectTypeOf, test } from 'vitest'

type VfSelectDefinition = ComponentRegistry['VfSelect']
type VfSelectSchemaEntry = SchemaEntryOf<'VfSelect'>
type ObjectItems = [
  { id: 1; label: 'A'; foo: () => void },
  { id: 2; label: 'B'; foo: () => void },
]
type SelectContext = ContextOf<'VfSelect'>

describe('VfSelect expose — factory API lives on VfSelectExpose; context unwraps its refs', () => {
  test('every Expose key appears on the public context (values may be unwrapped)', () => {
    expectTypeOf<keyof VfSelectExpose>().toExtend<keyof SelectContext>()
    expectTypeOf<keyof VfSelectExpose>().toExtend<
      keyof VfSelectDefinition['context']
    >()
  })

  test('props / outlets / parts / classes are typed', () => {
    expectTypeOf<SelectContext['props']>().not.toBeAny()
    expectTypeOf<SelectContext['props']>().toHaveProperty('multiple')
    expectTypeOf<SelectContext['props']>().toHaveProperty('items')
    expectTypeOf<SelectContext['outlets']>().not.toBeAny()
    expectTypeOf<SelectContext['outlets']>().toHaveProperty('template')
    expectTypeOf<SelectContext['parts']>().toHaveProperty('input')
    expectTypeOf<SelectContext['classes']>().toHaveProperty('input')
    // Undeclared keys resolve at runtime (lazy proxy) — templates may read keys
    // they registered via `useClasses`, so the context must not reject them.
    expectTypeOf<SelectContext['classes']['customIcon']>().toBeAny()
  })

  test('event bus and app-level members are exposed', () => {
    expectTypeOf<SelectContext>().toHaveProperty('fire')
    expectTypeOf<SelectContext>().toHaveProperty('on')
    expectTypeOf<SelectContext>().toHaveProperty('off')
    expectTypeOf<SelectContext>().toHaveProperty('onBefore')
    expectTypeOf<SelectContext>().toHaveProperty('onAfter')
    expectTypeOf<SelectContext>().toHaveProperty('fireAsync')
    expectTypeOf<SelectContext>().toHaveProperty('hasListeners')
    expectTypeOf<SelectContext>().toHaveProperty('$config')
    expectTypeOf<SelectContext>().toHaveProperty('$locale')
    expectTypeOf<SelectContext>().toHaveProperty('$globals')
    expectTypeOf<SelectContext['$locale']>().toHaveProperty('set')
    expectTypeOf<SelectContext['$config']>().toHaveProperty('modules')
    expectTypeOf<SelectContext['$globals']>().toHaveProperty(
      'defaultBreakpoint'
    )
  })
})

describe('VfSelect generics — props (type-level) + schema defineSchema checks', () => {
  type ExactProps = VfSelectProps<ObjectItems, 'id'>
  type ExactMultiProps = VfSelectProps<ObjectItems, 'id', undefined, true>

  test('modelValue / default narrow to the item id union', () => {
    expectTypeOf<NonNullable<ExactProps['modelValue']>>().toExtend<
      1 | 2 | null
    >()
    expectTypeOf<NonNullable<ExactProps['default']>>().toExtend<
      1 | 2 | null | ExpressionString
    >()
    expectTypeOf<NonNullable<ExactMultiProps['modelValue']>>().toExtend<
      (1 | 2)[]
    >()
  })

  test('defineSchema accepts matching models and rejects mismatches', () => {
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
  })
})

describe('VfSelect contextual props (label) — schema + definition extraction', () => {
  type SchemaLabel = NonNullable<VfSelectSchemaEntry['label']>
  type SchemaLabelFn = Extract<SchemaLabel, (...args: any[]) => any>
  type SchemaLabelContext = Parameters<SchemaLabelFn>[0]

  test('schema label callback receives VfSelectContext', () => {
    expectTypeOf<SchemaLabelContext>().toExtend<VfSelectContext>()
    expectTypeOf<VfSelectContext>().toExtend<SchemaLabelContext>()
    expectTypeOf<SchemaLabelContext>().toHaveProperty('path')
    expectTypeOf<SchemaLabelContext>().not.toBeAny()
  })

  // Narrowed props pin contextual props to the narrowed context (invariant via
  // the callback parameter), so it matches `VfSelectContext<ExactProps>`, not
  // the wide `VfSelectContext`.
  test('narrowed props pin label to the narrowed context', () => {
    type ExactProps = VfSelectProps<ObjectItems, 'id'>
    type ExactLabelFn = Extract<
      NonNullable<ExactProps['label']>,
      (...args: any[]) => any
    >
    type ExactLabelContext = Parameters<ExactLabelFn>[0]

    expectTypeOf<ExactLabelContext>().toExtend<VfSelectContext<ExactProps>>()
    expectTypeOf<VfSelectContext<ExactProps>>().toExtend<ExactLabelContext>()
    expectTypeOf<ExactLabelContext['model']>().toEqualTypeOf<1 | 2 | null>()
  })

  test('defineSchema label callbacks are context-checked', () => {
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
  })
})

describe('VfSelect event handlers — schema + definition extraction', () => {
  type SchemaOnChange = NonNullable<VfSelectSchemaEntry['onChange']>
  type SchemaEventContext = Parameters<SchemaOnChange>[2]

  test('schema onChange receives VfSelectContext', () => {
    expectTypeOf<SchemaEventContext>().toExtend<VfSelectContext>()
    expectTypeOf<VfSelectContext>().toExtend<SchemaEventContext>()
    expectTypeOf<SchemaEventContext>().toHaveProperty('path')
    expectTypeOf<SchemaEventContext>().toHaveProperty('items')
    expectTypeOf<SchemaEventContext>().not.toBeAny()
  })

  test('emits change context is VfSelectContext', () => {
    type EventsChangeContext = VfSelectEmits['change'][2]

    expectTypeOf<EventsChangeContext>().toExtend<VfSelectContext>()
    expectTypeOf<VfSelectContext>().toExtend<EventsChangeContext>()
  })

  test('defineSchema event handlers are context-checked', () => {
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
  })
})

describe('VfSelect slots — definition extraction (SFC usage in .vue)', () => {
  // The #template slot payload is a single `context` prop. Default (bare)
  // generics keep the ContextOf shape; concrete generics refine model / items.
  test('template slot context exposes path / model / items / props', () => {
    type SlotContext = Parameters<VfSelectSlots['template']>[0]['context']

    expectTypeOf<SlotContext>().toHaveProperty('path')
    expectTypeOf<SlotContext>().toHaveProperty('model')
    expectTypeOf<SlotContext>().toHaveProperty('items')
    expectTypeOf<SlotContext>().toHaveProperty('props')
  })

  test('scalar multi slots refine model / props / items', () => {
    type ScalarMultiSlots = VfSelectSlots<[1, 2, 3], undefined, undefined, true>
    type ScalarMultiSlotContext = Parameters<
      ScalarMultiSlots['template']
    >[0]['context']

    expectTypeOf<ScalarMultiSlotContext['model']>().toEqualTypeOf<
      (1 | 2 | 3)[]
    >()
    expectTypeOf<true>().toExtend<
      NonNullable<ScalarMultiSlotContext['props']['multiple']>
    >()
    expectTypeOf<[1, 2, 3]>().toExtend<
      NonNullable<ScalarMultiSlotContext['props']['items']>
    >()
    expectTypeOf<
      ScalarMultiSlotContext['items'][number]['value']
    >().toEqualTypeOf<1 | 2 | 3>()
  })

  test('object slots refine model / item values', () => {
    type ObjectSlots = VfSelectSlots<ObjectItems, 'id'>
    type ObjectSlotContext = Parameters<ObjectSlots['template']>[0]['context']

    expectTypeOf<ObjectSlotContext['model']>().toEqualTypeOf<1 | 2 | null>()
    expectTypeOf<ObjectSlotContext['items'][number]['value']>().toEqualTypeOf<
      1 | 2
    >()
  })

  test('object multi slots refine model to an array', () => {
    type ObjectMultiSlots = VfSelectSlots<ObjectItems, 'id', undefined, true>
    type ObjectMultiSlotContext = Parameters<
      ObjectMultiSlots['template']
    >[0]['context']

    expectTypeOf<ObjectMultiSlotContext['model']>().toEqualTypeOf<(1 | 2)[]>()
  })
})

describe('VfSelect classes / parts / class:* / reclass:* / part:* — schema + extraction', () => {
  test('classes / reclass / parts object-form callbacks receive VfSelectContext', () => {
    type SchemaClassesInput = NonNullable<
      NonNullable<VfSelectSchemaEntry['classes']>['input']
    >
    type SchemaClassesFn = Extract<SchemaClassesInput, (...args: any[]) => any>
    type SchemaClassesContext = Parameters<SchemaClassesFn>[0]

    expectTypeOf<SchemaClassesContext>().toExtend<VfSelectContext>()
    expectTypeOf<VfSelectContext>().toExtend<SchemaClassesContext>()

    type SchemaReclassInput = NonNullable<
      NonNullable<VfSelectSchemaEntry['reclass']>['input']
    >
    type SchemaReclassFn = Extract<SchemaReclassInput, (...args: any[]) => any>
    type SchemaReclassContext = Parameters<SchemaReclassFn>[0]

    expectTypeOf<SchemaReclassContext>().toExtend<VfSelectContext>()
    expectTypeOf<VfSelectContext>().toExtend<SchemaReclassContext>()

    type SchemaPartsInput = NonNullable<
      NonNullable<VfSelectSchemaEntry['parts']>['input']
    >
    type SchemaPartsFn = Extract<SchemaPartsInput, (...args: any[]) => any>
    type SchemaPartsContext = Parameters<SchemaPartsFn>[0]

    expectTypeOf<SchemaPartsContext>().toExtend<VfSelectContext>()
    expectTypeOf<VfSelectContext>().toExtend<SchemaPartsContext>()
  })

  // `part:*` / `class:*` / `reclass:*` attr keys come from the declaration
  // merge in each unstyled.ts. Asserted in `shorthand-attrs-dist.test-d.ts`.
  test('defineSchema classes / reclass / parts are context-checked', () => {
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
  })
})
