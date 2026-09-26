import type { OptionKeyProp, OptionsProp } from '#primevue/features/options'
import type {
  ConditionalProp,
  ConditionsTriggerProp,
  EntryItemsOf,
  EntryPropOf,
} from '@vueform/core'
import type { MaybeRef } from 'vue'

/**
 * Allowed types for the `suggestions` prop. PrimeVue AutoComplete counterpart
 * of `OptionsProp`.
 */
export type SuggestionsProp<TContext = any> = OptionsProp<TContext>

/**
 * Resolves the `TSuggestions` generic from a registry `TEntry` payload's
 * `suggestions` prop — the AutoComplete counterpart of core `EntryItemsOf`.
 */
export type EntrySuggestionsOf<TEntry> = EntryItemsOf<{
  items: EntryPropOf<TEntry, 'suggestions'>
}>

/**
 * Props for PrimeVue AutoComplete-style elements (`suggestions` naming).
 *
 * Same options→model inference as `OptionsProps`, but:
 *
 * - the source prop is `suggestions` (not `options`)
 * - there is no `optionValue` — the model is the whole suggestion option (or
 *   scalar), matching core when `itemValue` is omitted
 */
export interface SuggestionsProps<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TContext = any,
> {
  /**
   * The suggestion items for the element.
   */
  suggestions?: MaybeRef<TSuggestions>

  /**
   * Resolves the label for a suggestion. A string key for property lookup, or a
   * function returning the label string. Not allowed for plain scalar arrays or
   * plain object/record maps.
   */
  optionLabel?: OptionKeyProp<TSuggestions, undefined, string>

  /**
   * Determines whether a suggestion is disabled. A string key for property
   * lookup, or a function returning a `ConditionalProp`. Not allowed for plain
   * scalar arrays or plain object/record maps.
   */
  optionDisabled?: OptionKeyProp<
    TSuggestions,
    undefined,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Custom HTTP headers to include when loading suggestions from an endpoint.
   */
  headers?: Record<string, string>

  /**
   * The HTTP method to use when loading suggestions from an endpoint. Defaults
   * to `'GET'`.
   */
  method?: string

  /**
   * The source that triggers re-resolution of function-based suggestions.
   * Accepts an array of element paths whose values are watched, a `Ref`, or a
   * function used as a watch getter. When omitted, function-based suggestions
   * are only re-resolved when the `suggestions` prop reference itself changes.
   */
  optionsTrigger?: ConditionsTriggerProp

  /**
   * The debounce delay in milliseconds applied before re-resolving
   * function-based suggestions when the `optionsTrigger` source changes.
   * Defaults to no debounce (immediate re-resolution).
   */
  optionsDebounce?: number

  /**
   * Transforms data received from an endpoint into the suggestions format. When
   * `suggestions` is a string (endpoint URL), the HTTP response data is passed
   * through this function before normalization.
   */
  transformOptions?: (data: any) => any[] | Record<string, any>
}
