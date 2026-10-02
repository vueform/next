/**
 * Type-level tests for VfCheckboxes slots (generic-aware `#template` / named
 * slots, matching VfSelect). Run by `pnpm test-dts`.
 */
import { describe, expectTypeOf, test } from 'vitest'
import type { ResolvedGroup, ResolvedItem } from '@vueform/core'
import type {
  VfCheckboxesProps,
  VfCheckboxesSlots,
} from '@vueform/core/components/VfCheckboxes'

type ObjectItems = [
  { id: 1; label: 'A'; foo: () => void },
  { id: 2; label: 'B'; foo: () => void },
]

describe('VfCheckboxes named slots', () => {
  type CheckboxProps = Parameters<VfCheckboxesSlots['checkbox']>[0]
  type ItemProps = Parameters<VfCheckboxesSlots['item']>[0]
  type DefaultProps = Parameters<VfCheckboxesSlots['default']>[0]
  type GroupProps = Parameters<VfCheckboxesSlots['group']>[0]

  test('checkbox slot overrides the model with per-checkbox boolean state', () => {
    expectTypeOf<CheckboxProps['model']>().toEqualTypeOf<boolean>()
    expectTypeOf<CheckboxProps['trueValue']>().toEqualTypeOf<true>()
    expectTypeOf<CheckboxProps['falseValue']>().toEqualTypeOf<false>()
  })

  test('item / default / group slots receive generic ResolvedItem / ResolvedGroup', () => {
    expectTypeOf<ItemProps['item']>().toEqualTypeOf<ResolvedItem<any, any>>()
    expectTypeOf<DefaultProps['items']>().toEqualTypeOf<
      ResolvedItem<any, any>[]
    >()
    expectTypeOf<DefaultProps['groups']>().toEqualTypeOf<
      ResolvedGroup<any, any>[]
    >()
    expectTypeOf<DefaultProps['grouped']>().toEqualTypeOf<boolean>()
    expectTypeOf<GroupProps['group']>().toEqualTypeOf<ResolvedGroup<any, any>>()
  })

  test('slots narrow item values to the exact items type', () => {
    type ExactSlots = VfCheckboxesSlots<ObjectItems, 'id'>
    type ExactItemProps = Parameters<ExactSlots['item']>[0]
    type ExactDefaultProps = Parameters<ExactSlots['default']>[0]
    type ExactGroupProps = Parameters<ExactSlots['group']>[0]

    expectTypeOf<ExactItemProps['item']['value']>().toEqualTypeOf<1 | 2>()
    expectTypeOf<ExactDefaultProps['items'][number]['value']>().toEqualTypeOf<
      1 | 2
    >()
    expectTypeOf<
      ExactGroupProps['group']['items'][number]['value']
    >().toEqualTypeOf<1 | 2>()
  })
})

describe('VfCheckboxes props', () => {
  test('modelValue is an array of the item id union (always multi)', () => {
    type ExactProps = VfCheckboxesProps<ObjectItems, 'id'>

    expectTypeOf<NonNullable<ExactProps['modelValue']>>().toExtend<(1 | 2)[]>()
  })
})

describe('VfCheckboxes #template slot', () => {
  test('context exposes path / model / items / props', () => {
    type SlotContext = Parameters<VfCheckboxesSlots['template']>[0]['context']

    expectTypeOf<SlotContext>().toHaveProperty('path')
    expectTypeOf<SlotContext>().toHaveProperty('model')
    expectTypeOf<SlotContext>().toHaveProperty('items')
    expectTypeOf<SlotContext>().toHaveProperty('props')
  })

  test('context is generic-aware for object items', () => {
    type ExactSlots = VfCheckboxesSlots<ObjectItems, 'id'>
    type ObjectSlotContext = Parameters<ExactSlots['template']>[0]['context']

    expectTypeOf<ObjectSlotContext['model']>().toEqualTypeOf<(1 | 2)[]>()
    expectTypeOf<ObjectSlotContext['items'][number]['value']>().toEqualTypeOf<
      1 | 2
    >()
    expectTypeOf<ObjectItems>().toExtend<
      NonNullable<ObjectSlotContext['props']['items']>
    >()
    expectTypeOf<ObjectSlotContext['props']>().not.toHaveProperty('multiple')
  })

  test('context is generic-aware for scalar items', () => {
    type ScalarSlots = VfCheckboxesSlots<[1, 2, 3]>
    type ScalarSlotContext = Parameters<ScalarSlots['template']>[0]['context']

    expectTypeOf<ScalarSlotContext['model']>().toEqualTypeOf<(1 | 2 | 3)[]>()
    expectTypeOf<ScalarSlotContext['items'][number]['value']>().toEqualTypeOf<
      1 | 2 | 3
    >()
  })
})
