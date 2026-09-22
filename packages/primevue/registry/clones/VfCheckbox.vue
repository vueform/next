<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
/**
 * VfCloneName — a custom element created from Vueform's `checkbox` blueprint.
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
  type ForwardedSlots,
  type WidenProps,
} from '@vueform/primevue'
import PrimeCheckbox, {
  type CheckboxSlots as ACheckboxSlots,
  type CheckboxProps as PvCheckboxProps,
} from 'primevue/checkbox'
import {
  blueprint,
  defaults,
  type CheckboxApi,
  type CheckboxClasses,
  type CheckboxEmits,
  type CheckboxExpose,
  type CheckboxParts,
  type CheckboxProps,
  type CheckboxSlots,
  type forwards,
} from '@vueform/primevue/blueprints/checkbox'
import type { Ref, VNode } from 'vue'
import '@vueform/primevue/choice.css'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxProps<
  '__TYPE__',
  TTrueValue,
  TFalseValue,
  VfCloneNameSlots<TTrueValue, TFalseValue>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TTrueValue, TFalseValue>>
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
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxEmits<
  VfCloneNameContext<VfCloneNameProps<TTrueValue, TFalseValue>>
> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<TTrueValue = any, TFalseValue = any>
  extends
    CheckboxSlots<
      VfCloneNameContext<VfCloneNameProps<TTrueValue, TFalseValue>>
    >,
    /* @vue-ignore */ ForwardedSlots<
      ACheckboxSlots,
      (typeof forwards.slots)[number]
    > {
  /**
   * Slot that replaces the default checkbox rendering. Receives input-specific
   * props.
   */
  default: (props: {
    model: TTrueValue | TFalseValue
    trueValue: TTrueValue
    falseValue: TFalseValue
    inputName: string
    id: string
    disabled: boolean
    input: any
    text: string | undefined
    aria: AriaProp
    handleBlur: (e: FocusEvent) => void
    handleFocus: (e: FocusEvent) => void
    handleInput: (payload: any, e?: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the checkbox.
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
export interface VfCloneNameParts extends CheckboxParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: Record<string, any>

  /**
   * The PrimeVue Checkbox input element.
   *
   * @tag Checkbox
   */
  input: PvCheckboxProps

  /**
   * The label/text element.
   *
   * @tag label
   */
  text: Record<string, any>
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
export interface VfCloneNameClasses extends CheckboxClasses {
  /**
   * The wrapper element surrounding the input and text.
   */
  wrapper: ClassValue

  /**
   * The PrimeVue Checkbox input element.
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
export interface VfCloneNameExpose extends CheckboxExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers receive
 * (`context$`). Its shape is derived from the blueprint and the interfaces
 * above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, CheckboxProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  CheckboxApi<TProps>
> {}

const Checkbox = vdomPrime(PrimeCheckbox)

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfCloneNameEmits<TTrueValue, TFalseValue>>()

const props = withDefaults(
  defineProps<VfCloneNameProps<TTrueValue, TFalseValue>>(),
  {
    ...defaults,
    type: '__TYPE__',
  }
)
const events = defineEvents<VfCloneNameEmits<TTrueValue, TFalseValue>>()
const slots = defineSlots<VfCloneNameSlots<TTrueValue, TFalseValue>>()

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

/**
 * The element's own classes, per part — reactive via the callback's api refs.
 * The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(({ props }) => ({
  root: 'vf-checkbox',
  wrapper: {
    'vf-choice-wrapper': true,
    'vf-left': props.align === 'left',
    'vf-right': props.align === 'right',
    'vf-aligned': !!props.aligned,
  },
  text: 'vf-choice-text',
}))

const trueValue = propRefs.trueValue as Ref<TTrueValue>
const falseValue = propRefs.falseValue as Ref<TFalseValue>

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

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry, EntryPropOr } from '@vueform/primevue'

type EntryProps<TEntry> = VfCloneNameProps<
  EntryPropOr<TEntry, 'trueValue', true>,
  EntryPropOr<TEntry, 'falseValue', false>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<
        EntryPropOr<TEntry, 'trueValue', true>,
        EntryPropOr<TEntry, 'falseValue', false>
      >,
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
        :aria
        :input-name
        :id
        :true-value
        :false-value
        :disabled
        :input
        :text
        :handle-blur
        :handle-focus
        :handle-input
      >
        <component
          v-if="outlets?.default"
          :is="outlets.default"
          :model
          :aria
          :input-name
          :id
          :true-value
          :false-value
          :disabled
          :input
          :text
          :handle-blur
          :handle-focus
          :handle-input
          :handle-model-update
        />
        <div v-else :class="classes.wrapper" v-bind="parts.wrapper">
          <Checkbox
            :name="inputName"
            :input-id="id"
            :class="classes.input"
            v-model="value"
            :true-value
            :false-value
            :disabled
            :readonly
            :invalid
            binary
            v-bind="{
              ...aria,
              ...forwardProps,
              ...parts.input,
            }"
            :ref="(el) => (input = el)"
            @change="handleInput"
            @blur="handleBlur"
            @focus="handleFocus"
          >
            <template
              v-for="(slot, slotName) in forwardSlots"
              :key="slotName"
              #[slotName]="scope"
            >
              <component :is="slot" v-bind="scope" />
            </template>
          </Checkbox>
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
