<script setup lang="ts" generic="const TRadioValue = true">
/**
 * VfCloneName — a custom element created from Vueform's `radio` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  inputAria,
  useBlueprint,
  defineEvents,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type WidenProps,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type RadioApi,
  type RadioClasses,
  type RadioEmits,
  type RadioExpose,
  type RadioParts,
  type RadioProps,
  type RadioSlots,
} from '@vueform/ui/blueprints/radio'
import type { Ref, VNode } from 'vue'

import '@vueform/ui/choice.css'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<TRadioValue = any> extends RadioProps<
  '__TYPE__',
  TRadioValue,
  VfCloneNameSlots<TRadioValue>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TRadioValue>>
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://ui.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<TRadioValue = any> extends RadioEmits<
  VfCloneNameContext<VfCloneNameProps<TRadioValue>>
> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<TRadioValue = any> extends RadioSlots<
  VfCloneNameContext<VfCloneNameProps<TRadioValue>>
> {
  /**
   * Slot that replaces the default radio input rendering. Receives
   * input-specific props.
   */
  default: (scope: {
    /**
     * The value used when the radio is selected.
     */
    value: TRadioValue

    /**
     * The current model value.
     */
    model: TRadioValue | null

    /**
     * The input's `name` attribute.
     */
    inputName: string

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * Whether the radio is disabled.
     */
    disabled: boolean

    /**
     * The input DOM element reference.
     */
    inputRef: any

    /**
     * The radio label text.
     */
    text: string | undefined

    /**
     * The default slot's own part is the wrapper (the fallback's top-level
     * element): its resolved part overrides and alignment modifiers; apply
     * with `v-bind`.
     */
    bindings: VfRadioResolvedBindings['wrapper']

    /**
     * Handler for the input's blur event.
     *
     * @param e The native blur event.
     */
    handleBlur: (e: FocusEvent) => void

    /**
     * Handler for the input's focus event.
     *
     * @param e The native focus event.
     */
    handleFocus: (e: FocusEvent) => void

    /**
     * Handler that updates the model from an input event.
     *
     * @param e The native input event.
     */
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   */
  text: (scope: {
    /**
     * The radio label text.
     */
    text: string | undefined

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * The element's generic name, used as screen-reader-only fallback text.
     */
    genericName: string

    /**
     * The text element's resolved bindings (part overrides); apply with
     * `v-bind`.
     */
    bindings: VfRadioResolvedBindings['text']
  }) => VNode[]
}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/ui').DomAttrsOf<'div'>
 *   component: import('@vueform/ui').PartOf<'VfButton'>
 *
 * @see https://ui.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends RadioParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The radio input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>

  /**
   * The label/text element.
   *
   * @tag label
   */
  text: DomAttrsOf<'label'>

  /**
   * The screen-reader-only text element.
   *
   * @tag label
   */
  srOnlyText: DomAttrsOf<'label'>
}

/**
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/ui').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/ui').ClassValue
 *
 * @see https://ui.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends RadioClasses {
  /**
   * The wrapper element surrounding the input and text.
   */
  wrapper: ClassValue

  /**
   * The radio input element.
   */
  input: ClassValue

  /**
   * The label/text element.
   */
  text: ClassValue
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
 * @see https://ui.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends RadioExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, RadioProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfRadioBindings,
  VfCloneNameExpose,
  RadioApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfCloneNameEmits<TRadioValue>>()

const props = withDefaults(defineProps<VfCloneNameProps<TRadioValue>>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits<TRadioValue>>()
const slots = defineSlots<VfCloneNameSlots<TRadioValue>>()

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
 * @see https://ui.vueform.com/guide/components#extending-the-logic
 */
const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

const radioValue = propRefs.radioValue as Ref<TRadioValue>

const {
  value,
  id,
  disabled,
  viewLoaded,
  inputName,
  text,
  inputRef,
  genericName,
  model,
  handleBlur,
  handleFocus,
  handleInput,
  handleModelUpdate,
} = api

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
const classes = useClasses({
  root: 'vf-radio',
  wrapper: 'vf-choice-wrapper',
  input: 'vf-choice-input',
  text: 'vf-choice-text',
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
    wrapper: () => ({
      'data-align': api.props.align || undefined,
      'data-aligned': api.props.aligned ? '' : undefined,
    }),
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  inputAria(api)
)

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryPropOr,
  ResolvedBindings,
} from '@vueform/ui'

type VfRadioResolvedBindings = ResolvedBindings<
  VfCloneNameParts,
  VfRadioBindings
>

type EntryProps<TEntry> = VfCloneNameProps<
  EntryPropOr<TEntry, 'radioValue', true>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<EntryPropOr<TEntry, 'radioValue', true>>,
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
    <VfLayout v-else :label="false">
      <slot
        :model
        :value="radioValue"
        :input-name
        :id
        :disabled
        :input-ref="inputRef"
        :text
        :bindings="bindings.wrapper()"
        :handle-blur
        :handle-focus
        :handle-model-update
      >
        <component
          v-if="outlets?.default"
          :is="outlets.default"
          :model
          :value="radioValue"
          :input-name
          :id
          :disabled
          :input-ref="inputRef"
          :text
          :bindings="bindings.wrapper()"
          :handle-blur
          :handle-focus
          :handle-model-update
        />
        <div v-else :class="classes.wrapper" v-bind="bindings.wrapper()">
          <input
            type="radio"
            v-model="value"
            :name="inputName"
            :value="radioValue"
            :id
            :disabled
            :class="classes.input"
            v-bind="bindings.input()"
            :ref="(el) => (inputRef = el)"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInput"
          />
          <slot name="text" :text :id :generic-name :bindings="bindings.text()">
            <component
              v-if="outlets?.text"
              :is="outlets.text"
              :text
              :id
              :generic-name
              :bindings="bindings.text()"
            />
            <label
              v-else-if="text"
              :for="id"
              :class="classes.text"
              v-bind="bindings.text()"
              >{{ text }}</label
            >
            <label v-else class="sr-only" :for="id">{{ genericName }}</label>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
