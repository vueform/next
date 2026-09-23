/**
 * Type-level assertions for VfCheckboxes slots (generic-aware `#template` /
 * named slots, matching VfSelect). Validated by `pnpm tsc:types`.
 */
import type { ResolvedGroup, ResolvedItem } from '@vueform/core'
import type { VfCheckboxesProps, VfCheckboxesSlots } from '@vueform/core/components/VfCheckboxes'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type HasKey<T, K extends string> = K extends keyof T ? true : false

type ObjectItems = [{ id: 1; label: 'A'; foo: () => void }, { id: 2; label: 'B'; foo: () => void }]

// ---------------------------------------------------------------------------
// Named slots — checkbox model overrides + generic ResolvedItem / ResolvedGroup
// ---------------------------------------------------------------------------

type CheckboxProps = Parameters<VfCheckboxesSlots['checkbox']>[0]
type ItemProps = Parameters<VfCheckboxesSlots['item']>[0]
type DefaultProps = Parameters<VfCheckboxesSlots['default']>[0]
type GroupProps = Parameters<VfCheckboxesSlots['group']>[0]

type _checkboxModel = Expect<Equal<CheckboxProps['model'], boolean>>
type _checkboxTrueValue = Expect<Equal<CheckboxProps['trueValue'], true>>
type _checkboxFalseValue = Expect<Equal<CheckboxProps['falseValue'], false>>
type _itemItem = Expect<Equal<ItemProps['item'], ResolvedItem<any, any>>>
type _defaultItems = Expect<Equal<DefaultProps['items'], ResolvedItem<any, any>[]>>
type _defaultGroups = Expect<Equal<DefaultProps['groups'], ResolvedGroup<any, any>[]>>
type _defaultGrouped = Expect<Equal<DefaultProps['grouped'], boolean>>
type _groupGroup = Expect<Equal<GroupProps['group'], ResolvedGroup<any, any>>>

type ExactSlots = VfCheckboxesSlots<ObjectItems, 'id'>
type ExactItemProps = Parameters<ExactSlots['item']>[0]
type ExactDefaultProps = Parameters<ExactSlots['default']>[0]
type ExactGroupProps = Parameters<ExactSlots['group']>[0]

type _exactItemValue = Expect<Equal<ExactItemProps['item']['value'], 1 | 2>>
type _exactDefaultItemValue = Expect<Equal<ExactDefaultProps['items'][number]['value'], 1 | 2>>
type _exactGroupItemValue = Expect<Equal<ExactGroupProps['group']['items'][number]['value'], 1 | 2>>

// ---------------------------------------------------------------------------
// Props — items / model precision (always multi)
// ---------------------------------------------------------------------------

type ExactProps = VfCheckboxesProps<ObjectItems, 'id'>
type _modelIsIdArray = Expect<NonNullable<ExactProps['modelValue']> extends (1 | 2)[] ? true : false>

// ---------------------------------------------------------------------------
// #template slot — generic-aware context
// ---------------------------------------------------------------------------

type SlotContext = Parameters<VfCheckboxesSlots['template']>[0]['context']
type _slotContextHasPath = Expect<HasKey<SlotContext, 'path'>>
type _slotContextHasModel = Expect<HasKey<SlotContext, 'model'>>
type _slotContextHasItems = Expect<HasKey<SlotContext, 'items'>>
type _slotContextHasProps = Expect<HasKey<SlotContext, 'props'>>

type ObjectSlotContext = Parameters<ExactSlots['template']>[0]['context']
type _objectModel = Expect<Equal<ObjectSlotContext['model'], (1 | 2)[]>>
type _objectItemValue = Expect<Equal<ObjectSlotContext['items'][number]['value'], 1 | 2>>
type _objectPropsItems = Expect<ObjectItems extends NonNullable<ObjectSlotContext['props']['items']> ? true : false>
type _objectPropsNoMultiple = Expect<'multiple' extends keyof ObjectSlotContext['props'] ? false : true>

type ScalarSlots = VfCheckboxesSlots<[1, 2, 3]>
type ScalarSlotContext = Parameters<ScalarSlots['template']>[0]['context']
type _scalarModel = Expect<Equal<ScalarSlotContext['model'], (1 | 2 | 3)[]>>
type _scalarItemValue = Expect<Equal<ScalarSlotContext['items'][number]['value'], 1 | 2 | 3>>
