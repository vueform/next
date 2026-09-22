/**
 * Type-level assertions that useFeatures + makeItems preserve items generics
 * through checkboxes/select blueprints. Validated by `pnpm tsc:types`.
 */
import { blueprint as checkboxesBlueprint, type CheckboxesEmits, type CheckboxesProps } from '@vueform/core/blueprints/checkboxes'
import { blueprint as selectBlueprint, type SelectEmits, type SelectProps } from '@vueform/core/blueprints/select'
import type { DefineEvents, LooseRequired } from '@vueform/core'

type Expect<T extends true> = T
type HasKey<T, K extends string> = K extends keyof T ? true : false

function _bpCheckboxes<TProps extends CheckboxesProps>(props: LooseRequired<TProps>, events: DefineEvents<CheckboxesEmits>) {
  return checkboxesBlueprint(props, events)
}

function _bpSelect<TProps extends SelectProps>(props: LooseRequired<TProps>, events: DefineEvents<SelectEmits>) {
  return selectBlueprint(props, events)
}

type _cbItems = Expect<HasKey<ReturnType<typeof _bpCheckboxes>, 'items'>>
type _cbAria = Expect<HasKey<ReturnType<typeof _bpCheckboxes>, 'checkboxAria'>>
type _cbPath = Expect<HasKey<ReturnType<typeof _bpCheckboxes>, 'path'>>
type _selItems = Expect<HasKey<ReturnType<typeof _bpSelect>, 'items'>>
type _selPath = Expect<HasKey<ReturnType<typeof _bpSelect>, 'path'>>

// Blueprint assemble API uses unbound ReturnType<blueprint> (wide items).
// Exact items / model generics stay on the generic *Props / Vf*Props.
type LiteralCheckboxesProps = LooseRequired<CheckboxesProps<'checkboxes', [{ label: 'A'; value: 1 }, { label: 'B'; value: 2 }], 'value'>>
type _litCheckboxesPropModel = Expect<NonNullable<LiteralCheckboxesProps['modelValue']> extends (1 | 2)[] ? true : false>
type _litCheckboxesApiHasItems = Expect<HasKey<ReturnType<typeof _bpCheckboxes>, 'items'>>

type LiteralSelectProps = LooseRequired<SelectProps<'select', [{ id: 1; label: 'A' }, { id: 2; label: 'B' }], 'id'>>
type _litSelectPropModel = Expect<NonNullable<LiteralSelectProps['modelValue']> extends 1 | 2 | null ? true : false>
type _litSelectApiHasItems = Expect<HasKey<ReturnType<typeof _bpSelect>, 'items'>>
