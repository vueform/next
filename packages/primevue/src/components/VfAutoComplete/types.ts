import type {
  ClassValue,
  AddonsSlots,
  IconsSlots,
  AddonsParts,
  IconsParts,
  AddonGroupParts,
  EntryMultipleOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type { AutoCompleteProps as PvAutoCompleteProps } from 'primevue'
import type { AutoCompleteSlots as AAutoCompleteSlots } from 'primevue/autocomplete'
import type { VNode } from 'vue'

import type {
  AutoCompleteApi,
  AutoCompleteClasses,
  AutoCompleteEmits,
  AutoCompleteExpose,
  AutoCompleteParts,
  AutoCompleteProps,
  AutoCompleteSlots,
  forwards,
} from '#src/blueprints/auto-complete'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
  EntrySuggestionsOf,
  SuggestionsProp,
} from '#src/features'
import type { ForwardedSlots, OverrideSlots } from '#src/types'

/**
 * VfAutoComplete props narrowed from a registry `TEntry` payload, applying the
 * entry's `suggestions` / `multiple` props as generics. There is no
 * `optionValue` — the model is the suggestion item itself.
 */
export type EntryProps<TEntry> = VfAutoCompleteProps<
  EntrySuggestionsOf<TEntry>,
  EntryMultipleOf<TEntry>
>

/**
 * Generic props interface for the VfAutoComplete component, parameterized by
 * the suggestion-driving type arguments (e.g. `VfAutoCompleteProps<typeof
 * suggestions>`). Reach for `VfAutoCompleteProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfAutoCompleteProps<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
> extends AutoCompleteProps<
  'auto-complete',
  TSuggestions,
  TMultiple,
  TModel,
  VfAutoCompleteSlots<TSuggestions, TMultiple, TModel>,
  VfAutoCompleteParts,
  VfAutoCompleteClasses,
  VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>
> {}

/**
 * Events emitted by the VfAutoComplete component, parameterized by the
 * suggestion-driving type arguments so event handlers (e.g. `@change`) receive
 * the narrowed context — same pattern as `VfAutoCompleteSlots`. Plain usage
 * (`VfAutoCompleteEmits`) keeps the context wide.
 */
export interface VfAutoCompleteEmits<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
> extends AutoCompleteEmits<
  VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>
> {}

/**
 * Slots available in the VfAutoComplete component.
 *
 * `#template` is generic-aware; forwarded PrimeVue slot shapes use wide
 * item/model types.
 */
export interface VfAutoCompleteSlots<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
>
  extends
    AutoCompleteSlots<
      VfAutoCompleteContext<
        VfAutoCompleteProps<TSuggestions, TMultiple, TModel>
      >
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<AAutoCompleteSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom content for each suggestion option.
         */
        option: (props: {
          /**
           * The raw suggestion item.
           */
          option: any

          /**
           * Index of the option.
           */
          index: number
        }) => VNode[]

        /**
         * Custom content for each suggestion option group.
         */
        optiongroup: (props: {
          /**
           * The option group, or raw suggestion when groups are not used.
           */
          option: any

          /**
           * Index of the option group.
           */
          index: number
        }) => VNode[]

        /**
         * Custom chip template for a selected suggestion in multiple mode.
         */
        chip: (props: {
          /**
           * A selected suggestion value.
           */
          value: any

          /**
           * Index of the token.
           */
          index: number

          /**
           * Removes the chip from the selection.
           *
           * @param event Browser event.
           */
          removeCallback: (event: Event) => void
        }) => VNode[]

        /**
         * Custom header template of the overlay panel.
         */
        header: (props: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Displayed suggestions.
           */
          suggestions: any[]
        }) => VNode[]

        /**
         * Custom footer template of the overlay panel.
         */
        footer: (props: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Displayed suggestions.
           */
          suggestions: any[]
        }) => VNode[]

        /**
         * Custom content template for virtual scrolling.
         */
        content: (props: {
          /**
           * Suggestions to display for the virtual scroller.
           */
          items: any[]

          /**
           * Style class of the content.
           */
          styleClass: string

          /**
           * Sets the content element ref.
           *
           * @param el Content element.
           */
          contentRef: (el: any) => void

          /**
           * Returns virtual scroller item options for a rendered index.
           *
           * @param index Rendered index.
           */
          getItemOptions: (index: number) => any
        }) => VNode[]
      }
    > {}

/**
 * Structural parts of the VfAutoComplete component.
 */
export interface VfAutoCompleteParts
  extends
    AutoCompleteParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The auto-complete input element.
   *
   * @tag AutoComplete
   */
  input: PvAutoCompleteProps
}

/**
 * CSS classes for the VfAutoComplete component's structural parts.
 */
export interface VfAutoCompleteClasses
  extends AutoCompleteClasses, FloatLabelClasses, IftaClasses {
  /**
   * The auto-complete input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfAutoComplete.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `AutoCompleteExpose` for all auto-complete-based
 * components) so they appear on `ContextOf<'VfAutoComplete'>` / `context$` /
 * `defineExpose`.
 */
export interface VfAutoCompleteExpose extends AutoCompleteExpose {}

/**
 * Public context for VfAutoComplete, optionally parameterized by concrete props
 * (e.g. `VfAutoCompleteContext<VfAutoCompleteProps<typeof suggestions>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfAutoCompleteContext<
  TProps extends WidenProps<
    VfAutoCompleteProps,
    AutoCompleteProps<string, SuggestionsProp>
  > = VfAutoCompleteProps,
> extends DefineElementContext<
  TProps,
  VfAutoCompleteEmits,
  VfAutoCompleteSlots,
  VfAutoCompleteParts,
  VfAutoCompleteClasses,
  VfAutoCompleteExpose,
  AutoCompleteApi<TProps>
> {}

/**
 * Registry entry for VfAutoComplete. `TEntry` narrows the props / emits /
 * context by the entry's suggestion-driving props, the same way SFC generics
 * do.
 */
export interface VfAutoCompleteEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfAutoCompleteEmits<EntrySuggestionsOf<TEntry>, EntryMultipleOf<TEntry>>,
  VfAutoCompleteSlots,
  VfAutoCompleteParts,
  VfAutoCompleteClasses,
  VfAutoCompleteContext<EntryProps<TEntry>>
> {}
