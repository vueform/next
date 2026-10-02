/**
 * Type-level assertions for VfRadios slots (generic `#template` / named slots).
 * Run by `pnpm test:dts`.
 */
import { describe, expectTypeOf, test } from 'vitest'
import type { ResolvedGroup, ResolvedItem } from '@vueform/core'
import type { VfRadiosProps, VfRadiosSlots } from '@vueform/core/components/VfRadios'

type ObjectItems = readonly [{ id: 1; label: 'A' }, { id: 2; label: 'B' }]

describe('VfRadios named slots', () => {
  type RadioSlotProps = Parameters<VfRadiosSlots['radio']>[0]
  type ItemProps = Parameters<VfRadiosSlots['item']>[0]
  type DefaultProps = Parameters<VfRadiosSlots['default']>[0]
  type GroupProps = Parameters<VfRadiosSlots['group']>[0]

  test('radio slot overrides the model with per-radio state', () => {
    expectTypeOf<RadioSlotProps['model']>().toEqualTypeOf<true | null>()
    expectTypeOf<RadioSlotProps['value']>().toEqualTypeOf<true>()
  })

  test('item / default / group slots receive ResolvedItem / ResolvedGroup', () => {
    // Bare generics resolve item value/raw to `any`; still assignable to ResolvedItem.
    expectTypeOf<ItemProps['item']>().toExtend<ResolvedItem>()
    expectTypeOf<DefaultProps['items']>().toExtend<ResolvedItem[]>()
    expectTypeOf<DefaultProps['groups']>().toExtend<ResolvedGroup[]>()
    expectTypeOf<DefaultProps['grouped']>().toEqualTypeOf<boolean>()
    expectTypeOf<GroupProps['group']>().toExtend<ResolvedGroup>()
  })
})

describe('VfRadios props', () => {
  // Items / model precision on props.
  test('modelValue is the item id union or null (always single)', () => {
    type ExactProps = VfRadiosProps<ObjectItems, 'id'>

    expectTypeOf<NonNullable<ExactProps['modelValue']>>().toExtend<1 | 2 | null>()
  })
})

describe('VfRadios #template slot', () => {
  // Bare `#template` keeps context shape; concrete generics refine model / items.
  test('context exposes path / model / items / props', () => {
    type SlotContext = Parameters<VfRadiosSlots['template']>[0]['context']

    expectTypeOf<SlotContext>().toHaveProperty('path')
    expectTypeOf<SlotContext>().toHaveProperty('model')
    expectTypeOf<SlotContext>().toHaveProperty('items')
    expectTypeOf<SlotContext>().toHaveProperty('props')
  })

  test('context is generic-aware for scalar items', () => {
    type ScalarSlots = VfRadiosSlots<[1, 2, 3]>
    type ScalarSlotContext = Parameters<ScalarSlots['template']>[0]['context']

    expectTypeOf<ScalarSlotContext['model']>().toEqualTypeOf<1 | 2 | 3 | null>()
    expectTypeOf<ScalarSlotContext['items'][number]['value']>().toEqualTypeOf<1 | 2 | 3>()
    expectTypeOf<Parameters<ScalarSlots['default']>[0]['items'][number]['value']>().toEqualTypeOf<1 | 2 | 3>()
    expectTypeOf<Parameters<ScalarSlots['item']>[0]['item']['value']>().toEqualTypeOf<1 | 2 | 3>()
  })

  test('context is generic-aware for object items', () => {
    type ObjectSlots = VfRadiosSlots<ObjectItems, 'id'>
    type ObjectSlotContext = Parameters<ObjectSlots['template']>[0]['context']

    expectTypeOf<ObjectSlotContext['model']>().toEqualTypeOf<1 | 2 | null>()
    expectTypeOf<ObjectSlotContext['items'][number]['value']>().toEqualTypeOf<1 | 2>()
    expectTypeOf<ObjectItems>().toExtend<NonNullable<ObjectSlotContext['props']['items']>>()
  })
})
