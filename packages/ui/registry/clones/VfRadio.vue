<script setup lang="ts" generic="const TRadioValue = true">
/**
 * VfCloneName — a custom element created from Vueform's `radio` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import type { Ref, VNode } from 'vue'
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
import {
  useBlueprint,
  defineEvents,
  type AriaProp,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type WidenProps,
} from '@vueform/ui'
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
  default: (props: {
    value: TRadioValue
    model: TRadioValue | null
    aria: AriaProp
    inputName: string
    id: string
    disabled: boolean
    input: any
    text: string | undefined
    handleBlur: (e: FocusEvent) => void
    handleFocus: (e: FocusEvent) => void
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   */
  text: (props: {
    text: string | undefined
    id: string
    genericName: string
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
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

const radioValue = propRefs.radioValue as Ref<TRadioValue>

const {
  value,
  id,
  disabled,
  viewLoaded,
  aria,
  inputName,
  text,
  input,
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
useClasses(({ props, hasError }) => ({
  root: 'vf-radio',
  wrapper: {
    'vf-choice-wrapper': true,
    'vf-left': props.align === 'left',
    'vf-right': props.align === 'right',
    'vf-aligned': !!props.aligned,
  },
  input: {
    'vf-choice-input': true,
    'vf-danger': hasError.value,
  },
  text: 'vf-choice-text',
}))

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry, EntryPropOr } from '@vueform/ui'

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
        :aria
        :input-name
        :id
        :disabled
        :input
        :text
        :handle-blur
        :handle-focus
        :handle-model-update
      >
        <component
          v-if="outlets?.default"
          :is="outlets.default"
          :model
          :value="radioValue"
          :aria
          :input-name
          :id
          :disabled
          :input
          :text
          :handle-blur
          :handle-focus
          :handle-model-update
        />
        <div v-else :class="classes.wrapper" v-bind="parts.wrapper">
          <input
            type="radio"
            v-model="value"
            :class="classes.input"
            :name="inputName"
            :value="radioValue"
            :id
            :disabled
            v-bind="{
              ...aria,
              ...parts.input,
            }"
            :ref="(el) => (input = el)"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInput"
          />
          <slot
            name="text"
            :text
            :id
            :generic-name
            :class="classes.text"
            v-bind="parts.text"
          >
            <component
              v-if="outlets?.text"
              :is="outlets.text"
              :text
              :id
              :generic-name
              :class="classes.text"
              v-bind="parts.text"
            />
            <label
              v-else-if="text"
              :class="classes.text"
              :for="id"
              v-bind="parts.text"
              >{{ text }}</label
            >
            <label v-else class="sr-only" :for="id">{{ genericName }}</label>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
