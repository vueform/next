import {
  type makeElement,
  type makeData,
  defineFeature,
  type ReturnsOf,
  type MakeItemsConfig,
  type makeInput,
  type FeatureEvents,
  aliasProps,
  clone,
  makeItems,
  type ItemLabel,
  type ItemDisabled,
  type ConditionsTriggerProp,
} from '@vueform/core'
import type {
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
} from 'primevue'
import { computed, type MaybeRef, ref, toRef, unref } from 'vue'

import type { SuggestionsProp } from './types'

/**
 * Configuration for the suggestions factory that normalizes AutoComplete
 * suggestions using PrimeVue-style prop names.
 */
type MakeSuggestionsOptions = {
  props: {
    suggestions?: MaybeRef<SuggestionsProp>
    optionLabel?: ItemLabel
    optionDisabled?: ItemDisabled
    optionsTrigger?: ConditionsTriggerProp
    optionsDebounce?: number
    /**
     * Transforms data received from an endpoint into the suggestions format.
     *
     * @param data The data received from the endpoint.
     */
    transformOptions?: (data: any) => any[] | Record<string, any>
    headers?: Record<string, string>
    method?: string
    multiple?: boolean
  }
  deps: ReturnsOf<
    [
      [typeof makeData, ['nullValue', 'update', 'model', 'pending']],
      [typeof makeElement, ['path']],
      [typeof makeInput, ['input', 'handleInput']],
    ]
  >
  events: FeatureEvents<{
    complete: [event: AutoCompleteCompleteEvent]
  }>
}

/**
 * Factory that normalizes AutoComplete suggestions via core `makeItems`,
 * mapping PrimeVue suggestion/option prop names onto the core items API.
 */
export const makeSuggestions = defineFeature(
  (config?: MakeItemsConfig) =>
    ({ deps, props, events }: MakeSuggestionsOptions) => {
      const {
        rawItems,
        resolvedItems,
        selectedLabel,
        grouped,
        resolving,
        itemDisabled,
        itemLabel,
        resolveItems,
      } = makeItems(config)({
        deps,
        props: aliasProps(props, {
          items: 'suggestions',
          itemLabel: 'optionLabel',
          itemDisabled: 'optionDisabled',
          itemsTrigger: 'optionsTrigger',
          itemsDebounce: 'optionsDebounce',
          transformItems: 'transformOptions',
        }),
      })

      // ================ REFS ================

      /**
       * The current search query typed into the AutoComplete input.
       */
      const query = ref('')

      const focusInputValue = toRef(() => {
        const focusInput = deps.input.value?.$refs.focusInput || undefined
        return (
          String(focusInput?.value || focusInput?.$el?.value || '') || undefined
        )
      })

      // ============== COMPUTED ==============

      /**
       * The resolved suggestion items passed to the AutoComplete.
       */
      const suggestions = computed(() => {
        const suggestions = unref(props.suggestions)
        return typeof suggestions === 'function' ||
          typeof suggestions === 'string'
          ? rawItems.value
          : (suggestions as any[] | undefined)
      })

      // =============== METHODS ==============

      /**
       * Handles the AutoComplete change event, updating the model and query.
       *
       * @param event The AutoComplete change event.
       */
      const handleChange = (event: AutoCompleteChangeEvent) => {
        deps.handleInput(event.value, event.originalEvent)
        query.value = focusInputValue.value ?? ''
      }

      /**
       * Handles the AutoComplete complete event, re-resolving function- or
       * endpoint-based suggestions for the typed query.
       *
       * @param event The AutoComplete complete event.
       */
      const handleComplete = (event: AutoCompleteCompleteEvent) => {
        events.fire('complete', event)

        if (
          typeof props.suggestions !== 'function' &&
          typeof props.suggestions !== 'string'
        ) {
          return
        }

        const searchValue = String(event.query) || focusInputValue.value || ''

        // Do not refetch options if the query hasn't changed in multple mode
        if (
          searchValue === query.value &&
          query.value &&
          props.multiple !== false
        ) {
          resolvedItems.value = clone(resolvedItems.value)
          return
        }

        query.value = searchValue
        resolveItems()
      }

      return {
        suggestions,
        resolvedItems,
        selectedLabel,
        itemLabel,
        itemDisabled,
        grouped,
        resolving,
        query,
        resolveItems,
        handleComplete,
        handleChange,
      }
    }
)
