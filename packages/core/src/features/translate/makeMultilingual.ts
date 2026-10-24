import {
  computed,
  ref,
  toRef,
  watch,
  type Ref,
  type WatchStopHandle,
} from 'vue'

import { useConfig, useI18n } from '#src/composables'
import { useFormContext } from '#src/contexts'
import type { makeElement } from '#src/features'
import { defineFeature } from '#src/helpers'
import type {
  AddonSchema,
  LanguagesProp,
  ResolvedLanguagesProp,
  ReturnsOf,
} from '#src/types'
import { warn } from '#src/utils'

/**
 * Configuration for the translatable factory handling language resolution and
 * the language selector addon.
 */
type makeMultilingualOptions = {
  props: {
    languages: LanguagesProp | undefined
    language: string | undefined
    translate: boolean | undefined
  }
  deps: ReturnsOf<[[typeof makeElement, ['id']]]>
}

/**
 * Provides translatable state, language resolution, and the language selector
 * addon schema for elements that support multilingual values.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeMultilingual = defineFeature(
  () =>
    ({ props, deps }: makeMultilingualOptions) => {
      const form$ = useFormContext() as any
      const config = useConfig()
      const { localizeObject } = useI18n()

      let watchFormLanguage: WatchStopHandle | undefined

      /**
       * Resolved map of available languages for translatable elements.
       */
      const languages: Ref<ResolvedLanguagesProp> = computed(() =>
        localizeObject(props.languages ?? form$?.languages ?? config.languages)
      )

      /**
       * Whether the element is in translatable (multilingual) mode.
       */
      const translatable = computed(
        () => !!props.translate && !!Object.keys(languages.value).length
      )

      const defaultLanguage = toRef(
        () =>
          props.language ||
          (props.languages
            ? Object.keys(props.languages || {})[0]
            : form$?.language || 'default')
      )

      /**
       * The currently active language for translatable elements.
       */
      const language = ref<string>(defaultLanguage.value)

      /**
       * Unique DOM id for the language indicator element.
       */
      const languageId = computed(() =>
        deps.id ? `${deps.id.value}__language` : undefined
      )

      watch(
        translatable,
        (n) => {
          watchFormLanguage?.()
          if (!n) return

          watchFormLanguage = watch(
            () => form$?.language,
            (n) => {
              if (languages.value?.[n]) {
                language.value = n
              } else {
                warn(
                  `[Vueform] Cannot switch to language '${n}' — it is not in the available languages for this element: [${Object.keys(languages.value).join(', ')}].`
                )
              }
            },
            { immediate: false }
          )
        },
        { immediate: true }
      )

      /**
       * Schema for the language selector addon rendered in translatable mode.
       */
      const translateAddon = computed(
        () =>
          ({
            type: 'select',
            name: 'language',
            detached: true,
            modelValue: language.value,
            items: languages.value,
            'onUpdate:modelValue': (v: string) => (language.value = v),
          }) as AddonSchema
      )

      return {
        translateAddon,
        language,
        languageId,
        languages,
        translatable,
      }
    }
)
