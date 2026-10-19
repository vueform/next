import type { DefineEvents, LooseRequired } from '@vueform/core'
/**
 * Type-level assertions that useFeatures + makeItems preserve items generics
 * through checkboxes/select blueprints. Run by `pnpm test-dts`.
 */
import {
  blueprint as checkboxesBlueprint,
  type CheckboxesEmits,
  type CheckboxesProps,
} from '@vueform/core/blueprints/checkboxes'
import {
  blueprint as selectBlueprint,
  type SelectEmits,
  type SelectProps,
} from '@vueform/core/blueprints/select'
import { describe, expectTypeOf, test } from 'vitest'

function _bpCheckboxes<TProps extends CheckboxesProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<CheckboxesEmits>
) {
  return checkboxesBlueprint(props, events)
}

function _bpSelect<TProps extends SelectProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<SelectEmits>
) {
  return selectBlueprint(props, events)
}

describe('blueprint factories preserve items generics', () => {
  test('checkboxes blueprint return exposes items / path', () => {
    expectTypeOf<ReturnType<typeof _bpCheckboxes>>().toHaveProperty('items')
    expectTypeOf<ReturnType<typeof _bpCheckboxes>>().toHaveProperty('path')
  })

  test('select blueprint return exposes items / path', () => {
    expectTypeOf<ReturnType<typeof _bpSelect>>().toHaveProperty('items')
    expectTypeOf<ReturnType<typeof _bpSelect>>().toHaveProperty('path')
  })

  // Blueprint assemble API uses unbound ReturnType<blueprint> (wide items).
  // Exact items / model generics stay on the generic *Props / Vf*Props.
  test('literal items keep an exact model on props; assemble API keeps items', () => {
    type LiteralCheckboxesProps = LooseRequired<
      CheckboxesProps<
        'checkboxes',
        [{ label: 'A'; value: 1 }, { label: 'B'; value: 2 }],
        'value'
      >
    >
    expectTypeOf<NonNullable<LiteralCheckboxesProps['modelValue']>>().toExtend<
      (1 | 2)[]
    >()
    expectTypeOf<ReturnType<typeof _bpCheckboxes>>().toHaveProperty('items')

    type LiteralSelectProps = LooseRequired<
      SelectProps<
        'select',
        [{ id: 1; label: 'A' }, { id: 2; label: 'B' }],
        'id'
      >
    >
    expectTypeOf<NonNullable<LiteralSelectProps['modelValue']>>().toExtend<
      1 | 2 | null
    >()
    expectTypeOf<ReturnType<typeof _bpSelect>>().toHaveProperty('items')
  })
})
