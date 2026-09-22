<script setup lang="ts" generic="const TRadioValue = true">
/**
 * VfCloneName — a custom element created from Vueform's `radio-button`
 * blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  vdomPrime,
  type AriaProp,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type WidenProps,
} from '@vueform/primevue'
import PrimeRadioButton, {
  type RadioButtonProps as PvRadioButtonProps,
} from 'primevue/radiobutton'
import {
  blueprint,
  defaults,
  type RadioButtonApi,
  type RadioButtonClasses,
  type RadioButtonEmits,
  type RadioButtonExpose,
  type RadioButtonParts,
  type RadioButtonProps,
  type RadioButtonSlots,
} from '@vueform/primevue/blueprints/radio-button'
import type { Ref, VNode } from 'vue'
import '@vueform/primevue/choice.css'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<TRadioValue = any> extends RadioButtonProps<
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
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<TRadioValue = any> extends RadioButtonEmits<
  VfCloneNameContext<VfCloneNameProps<TRadioValue>>
> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<TRadioValue = any> extends RadioButtonSlots<
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
    handleInput: (payload: any, e?: Event) => void
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   *
   * @param props.text The resolved label text.
   * @param props.id The element's unique ID.
   * @param props.genericName The element's display name for accessibility.
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
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends RadioButtonParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The PrimeVue RadioButton input element.
   *
   * @tag RadioButton
   */
  input: PvRadioButtonProps

  /**
   * The label/text element.
   *
   * @tag label
   */
  text: DomAttrsOf<'label'>
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
export interface VfCloneNameClasses extends RadioButtonClasses {
  /**
   * The wrapper element surrounding the input and text.
   */
  wrapper: ClassValue

  /**
   * The PrimeVue RadioButton input element.
   */
  input: ClassValue

  /**
   * The label/text element.
   */
  text: ClassValue
}

/**
 * Custom exposed API members. Add props you return from useBlueprint's 5th
 * 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://primevue.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends RadioButtonExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers receive
 * (`context$`). Its shape is derived from the blueprint and the interfaces
 * above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, RadioButtonProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  RadioButtonApi<TProps>
> {}

const RadioButton = vdomPrime(PrimeRadioButton)
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
 * Extend the element's API by passing a 5th 'extend' callback to useBlueprint —
 * whatever it returns merges into the api / expose (declare the members on
 * VfCloneNameExpose above).
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
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

const radioValue = propRefs.value as Ref<TRadioValue> // @todo: look into if it's possible to remove this from all comps

const {
  model,
  value,
  id,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  aria,
  inputName,
  text,
  input,
  genericName,
  forwardProps,
  forwardSlots,
  handleBlur,
  handleFocus,
  handleInput,
  handleModelUpdate,
} = api

/**
 * The element's own classes, per part — reactive via the callback's api refs.
 * The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(({ props }) => ({
  root: 'vf-radio-button',
  wrapper: {
    'vf-choice-wrapper': true,
    'vf-left': props.align === 'left',
    'vf-right': props.align === 'right',
    'vf-aligned': !!props.aligned,
  },
  text: 'vf-choice-text',
}))

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry, EntryPropOr } from '@vueform/primevue'

type EntryProps<TEntry> = VfCloneNameProps<EntryPropOr<TEntry, 'value', true>>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<EntryPropOr<TEntry, 'value', true>>,
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
        :handle-input
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
          :handle-input
          :handle-model-update
          :class="classes.wrapper"
          v-bind="parts.wrapper"
        />
        <div v-else :class="classes.wrapper" v-bind="parts.wrapper">
          <RadioButton
            v-model="value"
            :name="inputName"
            :input-id="id"
            :class="classes.input"
            :value="radioValue"
            :disabled
            :readonly
            :invalid
            v-bind="{
              ...aria,
              ...forwardProps,
              ...parts.input,
            }"
            :ref="(el) => (input = el)"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInput"
          >
            <template
              v-for="(slot, slotName) in forwardSlots"
              :key="slotName"
              #[slotName]="scope"
            >
              <component :is="slot" v-bind="scope" />
            </template>
          </RadioButton>
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
