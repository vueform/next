import { computed } from 'vue'

import { type makeLayout, type makeData } from '#src/features'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf } from '#src/types'

import { buildDescribedBy, buildLayoutBags } from './helpers'
import type { GroupAriaA11y } from './types'

/**
 * Configuration for the group ARIA factory resolving the group container's
 * role, labelling, and state attributes.
 */
type MakeGroupAriaOptions = {
  props: {
    /**
     * When `true`, the label group (which also hosts the help region) is not
     * rendered.
     */
    hideLabel?: boolean
  }
  deps: ReturnsOf<
    [
      [
        typeof makeLayout,
        [
          'label',
          'labelId',
          'helpId',
          'descriptionId',
          'errorId',
          'help',
          'description',
          'genericName',
        ],
      ],
      [typeof makeData, ['invalid', 'required', 'hasError']],
    ]
  >
}

/**
 * Provides the part-keyed accessibility bindings for a choice-group element
 * (radio/checkbox groups): the `group` bag carries the container's role,
 * labelling (labelledby when a label renders, aria-label fallback otherwise),
 * describedby, and group-level state.
 *
 * @param config Group options; `role` picks the container role (`'group'` by
 *   default, `'radiogroup'` for radio groups).
 */
export const makeGroupAria = defineFeature(
  (config?: {
    /**
     * The group container's ARIA role: `'group'` (default) for checkbox
     * groups, `'radiogroup'` for radio groups.
     */
    role?: 'group' | 'radiogroup'
  }) =>
    ({ props, deps }: MakeGroupAriaOptions) => {
      const {
        label,
        labelId,
        helpId,
        descriptionId,
        errorId,
        help,
        description,
        genericName,
        invalid,
        required,
        hasError,
      } = deps

      /**
       * Part-keyed accessibility bindings: role, labelling, and ARIA state for
       * the group container plus ids/roles for the layout-rendered parts.
       */
      const a11yBindings = computed<GroupAriaA11y>(() => ({
        group: {
          role: config?.role ?? 'group',
          // A slot-only label resolves to '' but still renders, so the test is
          // against undefined, not truthiness.
          'aria-labelledby':
            label.value !== undefined ? labelId.value : undefined,
          'aria-label':
            label.value === undefined ? genericName.value : undefined,
          // The help region renders inside the label group, so it only exists
          // when the label does.
          'aria-describedby': buildDescribedBy([
            !!help.value && label.value !== undefined && !props.hideLabel
              ? helpId.value
              : null,
            description.value ? descriptionId.value : null,
            hasError.value ? errorId.value : null,
          ]),
          'aria-invalid': invalid.value || undefined,
          'aria-required': required.value || undefined,
        },
        ...buildLayoutBags({
          labelId: labelId.value,
          helpId: helpId.value,
          descriptionId: descriptionId.value,
          errorId: errorId.value,
        }),
      }))

      return {
        a11yBindings,
      }
    }
)
