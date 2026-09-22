import {
  defineFeature,
  type AriaProp,
  type ReturnsOf,
  type TProp,
  type makeData,
  type makeLayout,
  type makeMultilingual,
} from '@vueform/core'
import { computed } from 'vue'
import { type makeFloatLabel, type makeIfta } from '@/features'

/**
 * Configuration for the PrimeVue text ARIA factory resolving language-aware
 * describedby and lang attributes with float-label and IFTA awareness.
 */
type MakeTAriaOptions = {
  props: {
    aria: AriaProp | undefined
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
 * Provides computed ARIA attributes for PrimeVue translatable text inputs,
 * including language-aware describedby, lang, and float-label/IFTA-aware label
 * referencing.
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
       * Computed ARIA attributes including language-aware describedby, lang,
       * and float-label/IFTA-aware label referencing.
       */
      const aria = computed(() => ({
        'aria-describedby':
          [
            (ifta?.value !== undefined || floatLabel?.value !== undefined) &&
            !!label.value
              ? labelId.value
              : null,
            translatable.value ? languageId.value : null,
            props.help ? helpId.value : null,
            props.description ? descriptionId.value : null,
            hasError.value ? errorId.value : null,
          ]
            .filter((d) => !!d)
            .join(' ') || undefined,
        'aria-invalid': hasError.value || undefined,
        'aria-required': required.value || undefined,
        'aria-busy': busy.value || undefined,
        'aria-lang': translatable.value ? language.value : undefined,
        ...props.aria,
      }))

      return {
        aria,
      }
    }
)
