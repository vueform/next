import {
  buildDescribedBy,
  buildLayoutBags,
  defineFeature,
  type ReturnsOf,
  type TAriaA11y,
  type TProp,
  type makeData,
  type makeLayout,
  type makeMultilingual,
} from '@vueform/core'
import { computed } from 'vue'

import { type makeFloatLabel, type makeIfta } from '#src/features'

/**
 * Configuration for the PrimeVue text ARIA factory resolving language-aware
 * describedby and lang attributes with float-label and IFTA awareness.
 */
type MakeTAriaOptions = {
  props: {
    help: TProp | undefined
    description: TProp | undefined
  }

  deps: ReturnsOf<
    [
      [
        typeof makeLayout,
        ['labelId', 'helpId', 'descriptionId', 'errorId', 'label'],
      ],
      [typeof makeMultilingual, ['language', 'languageId', 'translatable']],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ],
    [[typeof makeFloatLabel, ['floatLabel']], [typeof makeIfta, ['ifta']]]
  >
}

/**
 * Provides the part-keyed accessibility bindings for PrimeVue translatable
 * text inputs: the `input` bag carries a language-aware, float-label/IFTA-aware
 * describedby plus the input's `lang`, and the layout bags (label, help,
 * description, error) carry the ids and roles their regions must render with.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeTAria = defineFeature(
  () =>
    ({ props, deps }: MakeTAriaOptions) => {
      const {
        label,
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
        floatLabel,
        ifta,
      } = deps

      /**
       * Part-keyed accessibility bindings including the language-aware,
       * float-label/IFTA-aware describedby and the input's lang attribute.
       */
      const a11yBindings = computed<TAriaA11y>(() => ({
        input: {
          'aria-describedby': buildDescribedBy([
            (ifta?.value !== undefined || floatLabel?.value !== undefined) &&
            !!label.value
              ? labelId.value
              : null,
            translatable.value ? languageId.value : null,
            props.help ? helpId.value : null,
            props.description ? descriptionId.value : null,
            hasError.value ? errorId.value : null,
          ]),
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
      }))

      return {
        a11yBindings,
      }
    }
)
