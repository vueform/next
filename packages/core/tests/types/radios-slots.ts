/**
 * Type-level assertions for VfRadios slots (generic `#template` / named slots).
 * Validated by `pnpm tsc:types`.
 */
import type { ResolvedGroup, ResolvedItem } from '@vueform/core'
import type { VfRadiosProps, VfRadiosSlots } from '@vueform/core/components/VfRadios'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type HasKey<T, K extends string> = K extends keyof T ? true : false

type RadioSlotProps = Parameters<VfRadiosSlots['radio']>[0]
type ItemProps = Parameters<VfRadiosSlots['item']>[0]
type DefaultProps = Parameters<VfRadiosSlots['default']>[0]
type GroupProps = Parameters<VfRadiosSlots['group']>[0]

type _radioModel = Expect<Equal<RadioSlotProps['model'], true | null>>
type _radioValue = Expect<Equal<RadioSlotProps['value'], true>>
// Bare generics resolve item value/raw to `any`; still assignable to ResolvedItem.
type _itemItem = Expect<ItemProps['item'] extends ResolvedItem ? true : false>
type _defaultItems = Expect<DefaultProps['items'] extends ResolvedItem[] ? true : false>
type _defaultGroups = Expect<DefaultProps['groups'] extends ResolvedGroup[] ? true : false>
type _defaultGrouped = Expect<Equal<DefaultProps['grouped'], boolean>>
type _groupGroup = Expect<GroupProps['group'] extends ResolvedGroup ? true : false>

// Items / model precision on props.
type ObjectItems = readonly [{ id: 1; label: 'A' }, { id: 2; label: 'B' }]
type ExactProps = VfRadiosProps<ObjectItems, 'id'>
type _modelIsId = Expect<NonNullable<ExactProps['modelValue']> extends 1 | 2 | null ? true : false>

// Bare `#template` keeps context shape; concrete generics refine model / items.
type SlotContext = Parameters<VfRadiosSlots['template']>[0]['context']
type _slotContextHasPath = Expect<HasKey<SlotContext, 'path'>>
type _slotContextHasModel = Expect<HasKey<SlotContext, 'model'>>
type _slotContextHasItems = Expect<HasKey<SlotContext, 'items'>>
type _slotContextHasProps = Expect<HasKey<SlotContext, 'props'>>

type ScalarSlots = VfRadiosSlots<[1, 2, 3]>
type ScalarSlotContext = Parameters<ScalarSlots['template']>[0]['context']
type _scalarModel = Expect<Equal<ScalarSlotContext['model'], 1 | 2 | 3 | null>>
type _scalarItemValue = Expect<Equal<ScalarSlotContext['items'][number]['value'], 1 | 2 | 3>>
type _scalarDefaultItem = Expect<Equal<Parameters<ScalarSlots['default']>[0]['items'][number]['value'], 1 | 2 | 3>>
type _scalarItemSlot = Expect<Equal<Parameters<ScalarSlots['item']>[0]['item']['value'], 1 | 2 | 3>>

type ObjectSlots = VfRadiosSlots<ObjectItems, 'id'>
type ObjectSlotContext = Parameters<ObjectSlots['template']>[0]['context']
type _objectModel = Expect<Equal<ObjectSlotContext['model'], 1 | 2 | null>>
type _objectItemValue = Expect<Equal<ObjectSlotContext['items'][number]['value'], 1 | 2>>
type _objectPropsItems = Expect<ObjectItems extends NonNullable<ObjectSlotContext['props']['items']> ? true : false>
