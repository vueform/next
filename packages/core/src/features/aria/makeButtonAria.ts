import { computed } from 'vue'

import {
  type makeButton,
  type makeDisabled,
  type makeLayout,
} from '#src/features'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf } from '#src/types'

import { buildDescribedBy, buildLayoutBags } from './helpers'
import type { ButtonAriaA11y } from './types'

/**
 * Configuration for the button ARIA factory resolving the control's
 * native/ARIA disabled mode, busy state, icon-only labelling, and describedby.
 */
type MakeButtonAriaOptions = {
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
          'help',
          'helpId',
          'description',
          'descriptionId',
          'errorId',
          'genericName',
        ],
      ],
      [typeof makeDisabled, ['disabled']],
      [
        typeof makeButton,
        ['href', 'to', 'icon', 'text', 'loading', 'displayErrors'],
      ],
    ]
  >
}

/**
 * Provides the part-keyed accessibility bindings for the button element: the
 * `button` bag carries disabled (native on `<button>`, `aria-disabled` on
 * anchors, which ignore the native attribute but must stay discoverable),
 * busy state, an icon-only accessible name, and describedby to the rendered
 * help/description/error regions.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeButtonAria = defineFeature(
  () =>
    ({ props, deps }: MakeButtonAriaOptions) => {
      const {
        label,
        labelId,
        help,
        helpId,
        description,
        descriptionId,
        errorId,
        genericName,
        disabled,
        href,
        to,
        icon,
        text,
        loading,
        displayErrors,
      } = deps

      /**
       * Part-keyed accessibility bindings: native/ARIA state for the button
       * control plus ids/roles for the layout-rendered label, help,
       * description, and error parts.
       */
      const a11yBindings = computed<ButtonAriaA11y>(() => {
        const isLink = !!(href.value || to.value)

        // The help region renders inside the label group, so it only exists
        // when the label does.
        const showsHelp =
          !!help.value && label.value !== undefined && !props.hideLabel

        return {
          button: {
            disabled: !isLink ? disabled.value || undefined : undefined,
            'aria-disabled': isLink ? disabled.value || undefined : undefined,
            'aria-busy': loading.value || undefined,
            'aria-label':
              icon.value && !text.value ? genericName.value : undefined,
            'aria-describedby': buildDescribedBy([
              showsHelp ? helpId.value : null,
              description.value ? descriptionId.value : null,
              displayErrors.value?.length ? errorId.value : null,
            ]),
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
