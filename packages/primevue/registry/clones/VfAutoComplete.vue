<script
  setup
  lang="ts"
  generic="
    TSuggestions extends SuggestionsProp = SuggestionsProp,
    TMultiple extends boolean = false,
    TModel = any
  "
>
/**
 * VfCloneName — a custom element created from Vueform's `auto-complete` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  type SuggestionsProp,
  vdomPrime,
  type AddonGroupParts,
  type AddonsParts,
  type AddonsSlots,
  type ClassValue,
  type DefineElementContext,
  type FloatLabelClasses,
  type FloatLabelParts,
  type FloatLabelSlots,
  type ForwardedSlots,
  type IconsParts,
  type IconsSlots,
  type IftaClasses,
  type IftaParts,
  type IftaSlots,
  type OverrideSlots,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type AutoCompleteApi,
  type AutoCompleteClasses,
  type AutoCompleteEmits,
  type AutoCompleteExpose,
  type AutoCompleteParts,
  type AutoCompleteProps,
  type AutoCompleteSlots,
  type forwards,
} from '@vueform/primevue/blueprints/auto-complete'
import type { AutoCompleteProps as PvAutoCompleteProps } from 'primevue'
import PrimeAutoComplete, {
  type AutoCompleteSlots as AAutoCompleteSlots,
} from 'primevue/autocomplete'
import type { VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
> extends AutoCompleteProps<
  '__TYPE__',
  TSuggestions,
  TMultiple,
  TModel,
  VfCloneNameSlots<TSuggestions, TMultiple, TModel>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TSuggestions, TMultiple, TModel>>
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
> extends AutoCompleteEmits<
  VfCloneNameContext<VfCloneNameProps<TSuggestions, TMultiple, TModel>>
> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
>
  extends
    AutoCompleteSlots<
      VfCloneNameContext<VfCloneNameProps<TSuggestions, TMultiple, TModel>>
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
        option: (scope: {
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
        optiongroup: (scope: {
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
        chip: (scope: {
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
        header: (scope: {
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
        footer: (scope: {
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
        content: (scope: {
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
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts
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
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/primevue').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/primevue').ClassValue
 *
 * @see https://primevue.vueform.com/guide/classes
 */
export interface VfCloneNameClasses
  extends AutoCompleteClasses, FloatLabelClasses, IftaClasses {
  /**
   * The auto-complete input element.
   */
  input: ClassValue
}

/**
 * Custom exposed API members. Add props you return from useBlueprint's
 * 5th 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://primevue.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends AutoCompleteExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<
    VfCloneNameProps,
    AutoCompleteProps<string, SuggestionsProp>
  > = VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfAutoCompleteBindings,
  VfCloneNameExpose,
  AutoCompleteApi<TProps>
> {}

const AutoComplete = vdomPrime(PrimeAutoComplete)

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<VfCloneNameEmits<TSuggestions, TMultiple, TModel>>()

const props = withDefaults(
  defineProps<VfCloneNameProps<TSuggestions, TMultiple, TModel>>(),
  {
    ...defaults,
    type: '__TYPE__',
  }
)
const events = defineEvents<VfCloneNameEmits<TSuggestions, TMultiple, TModel>>()
const slots = defineSlots<VfCloneNameSlots<TSuggestions, TMultiple, TModel>>()

/**
 * Extend the element's API by passing a 5th 'extend' callback to
 * useBlueprint — whatever it returns merges into the api / expose
 * (declare the members on VfCloneNameExpose above).
 *
 * @example
 *   useBlueprint(blueprint, props, events, slots, () => ({
 *     plain: '',
 *     vueRef: ref(''),
 *     method: (arg1: any, arg2: any) => '',
 *   }))
 *
 * @see https://primevue.vueform.com/guide/components#extending-the-logic
 */
const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
const classes = useClasses({
  root: 'vf-auto-complete',
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  inputAria(api)
)

const {
  value,
  id,
  placeholder,
  viewLoaded,
  disabled,
  loading,
  resolving,
  inputRef,
  name,
  invalid,
  suggestions,
  itemLabel,
  itemDisabled,
  forwardProps,
  forwardSlots,
  handleChange,
  handleFocus,
  handleBlur,
  handleComplete,
} = api

const { minLength } = propRefs

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryMultipleOf,
  EntrySuggestionsOf,
} from '@vueform/primevue'

type EntryProps<TEntry> = VfCloneNameProps<
  EntrySuggestionsOf<TEntry>,
  EntryMultipleOf<TEntry>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<EntrySuggestionsOf<TEntry>, EntryMultipleOf<TEntry>>,
      VfCloneNameSlots,
      VfCloneNameParts,
      VfCloneNameClasses,
      VfCloneNameContext<EntryProps<TEntry>>
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCloneName: (typeof import('./VfCloneName.vue'))['default']
  }
}
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading="false">
      <AutoComplete
        :name
        :id
        v-model="value"
        :suggestions
        :option-label="itemLabel"
        :option-disabled="itemDisabled"
        :placeholder
        :disabled
        :loading="loading || resolving"
        :invalid
        :min-length
        fluid
        :class="classes.input"
        v-bind="{ ...forwardProps, ...bindings.input() }"
        :ref="(el) => (inputRef = el)"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @complete="handleComplete"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </AutoComplete>
    </VfLayout>
  </slot>
</template>
