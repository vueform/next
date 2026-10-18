import { computed } from 'vue'

import { type makeLayout, type makeData } from '#src/features'
import type { makeMultilingual } from '#src/features/translate/makeMultilingual'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf } from '#src/types'

import { buildDescribedBy, buildLayoutBags } from './helpers'
import type { TAriaA11y } from './types'

/**
 * Configuration for the translatable-text ARIA factory resolving
 * language-aware describedby and lang attributes.
 */
type MakeTAriaOptions = {
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
      [typeof makeMultilingual, ['language', 'languageId', 'translatable']],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ]
  >
}

/**
 * Provides the part-keyed accessibility bindings for translatable text
 * inputs: the `input` bag additionally references the editing-language live
 * region and carries the input's `lang`.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeTAria = defineFeature(
  () =>
    ({ props, deps }: MakeTAriaOptions) => {
      const {
        label,
        help,
        description,
        labelId,
        helpId,
        descriptionId,
        errorId,
        language,
        languageId,
        translatable,
        hasError,
        required,
        busy,
      } = deps

      /**
       * Part-keyed accessibility bindings including the language-aware
       * describedby and the input's lang attribute.
       */
      const a11yBindings = computed<TAriaA11y>(() => {
        const hasLayout = props.layout !== false

        // The help region renders inside the label group, so it only exists
        // when the label does.
        const showsHelp =
          !!help.value && label.value !== undefined && !props.hideLabel

        return {
          input: {
            'aria-describedby': hasLayout
              ? buildDescribedBy([
                  translatable.value ? languageId.value : null,
                  showsHelp ? helpId.value : null,
                  description.value ? descriptionId.value : null,
                  hasError.value ? errorId.value : null,
                ])
              : undefined,
            'aria-invalid': hasError.value || undefined,
            'aria-required': required.value || undefined,
            'aria-busy': busy.value || undefined,
            lang: translatable.value ? language.value : undefined,
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
