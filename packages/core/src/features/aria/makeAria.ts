import { computed } from 'vue'

import { type makeLayout, type makeData } from '#src/features'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf } from '#src/types'

import { buildDescribedBy, buildLayoutBags } from './helpers'
import type { AriaA11y } from './types'

/**
 * Configuration for the ARIA factory wiring the input's ARIA state and the
 * layout parts' id relationships.
 */
type MakeAriaOptions = {
  props: {
    /**
     * When `false`, the element renders without its layout (no label, help,
     * description, or error regions), so no describedby relationship can be
     * established.
     */
    layout?: unknown

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
        ],
      ],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ]
  >
}

/**
 * Provides the part-keyed accessibility bindings for a single-input element:
 * the `input` bag carries ARIA state (describedby, invalid, required, busy),
 * and the layout bags (label, help, description, error) carry the ids and
 * roles their regions must render with.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeAria = defineFeature(
  () =>
    ({ props, deps }: MakeAriaOptions) => {
      const {
        label,
        help,
        description,
        labelId,
        helpId,
        descriptionId,
        errorId,
        hasError,
        busy,
        required,
      } = deps

      /**
       * Part-keyed accessibility bindings: ARIA attributes for the input and
       * ids/roles for the layout-rendered label, help, description, and error
       * parts.
       */
      const a11yBindings = computed<AriaA11y>(() => {
        const hasLayout = props.layout !== false

        // The help region renders inside the label group, so it only exists
        // when the label does.
        const showsHelp =
          !!help.value && label.value !== undefined && !props.hideLabel

        return {
          input: {
            'aria-describedby': hasLayout
              ? buildDescribedBy([
                  showsHelp ? helpId.value : null,
                  description.value ? descriptionId.value : null,
                  hasError.value ? errorId.value : null,
                ])
              : undefined,
            'aria-invalid': hasError.value || undefined,
            'aria-required': required.value || undefined,
            'aria-busy': busy.value || undefined,
          },
          ...buildLayoutBags({
            labelId: labelId.value,
            helpId: helpId.value,
            descriptionId: descriptionId.value,
            errorId: errorId.value,
          }),
        }
      })

      return {
        a11yBindings,
      }
    }
)
