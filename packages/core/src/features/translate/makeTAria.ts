import { computed } from 'vue'
import { type makeLayout, type makeData } from '@core/features'
import { defineFeature } from '@core/helpers'
import type { AriaProp, ReturnsOf, TProp } from '@core/types'
import type { makeMultilingual } from './makeMultilingual'

/**
 * Configuration for the text ARIA factory resolving language-aware describedby
 * and lang attributes.
 */
type MakeTAriaOptions = {
  props: {
    aria: AriaProp | undefined
    help: TProp | undefined
    description: TProp | undefined
  }

  deps: ReturnsOf<
    [
      [typeof makeLayout, ['helpId', 'descriptionId', 'errorId']],
      [typeof makeMultilingual, ['language', 'languageId', 'translatable']],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ]
  >
}

/**
 * Provides computed ARIA attributes for translatable text inputs, including
 * language-aware describedby and lang.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeTAria = defineFeature(
  () =>
    ({ props, deps }: MakeTAriaOptions) => {
      const {
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
       * Computed ARIA attributes including language-aware describedby and lang.
       */
      const aria = computed(() => {
        return {
          'aria-describedby':
            [
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
        }
      })

      return {
        aria,
      }
    }
)
