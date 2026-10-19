<script setup lang="ts" generic="const TRadioValue = true">
/**
 * VfCloneName — a custom element created from Vueform's `radio-button` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  vdomPrime,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type WidenProps,
} from '@vueform/primevue'
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
import PrimeRadioButton, {
  type RadioButtonProps as PvRadioButtonProps,
} from 'primevue/radiobutton'
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
  default: (scope: {
    /**
     * The value represented by the radio button when selected.
     */
    value: TRadioValue

    /**
     * The current model value.
     */
    model: TRadioValue | null

    /**
     * The `name` attribute of the input.
     */
    inputName: string

    /**
     * The element's unique ID.
     */
    id: string

    /**
     * Whether the input is disabled.
     */
    disabled: boolean

    /**
     * Ref to the underlying input element.
     */
    inputRef: any

    /**
     * The resolved label text.
     */
    text: string | undefined

    /**
     * The default slot's own part is the wrapper (the fallback's top-level
     * element): its resolved classes, part overrides, and alignment
     * modifiers; apply with `v-bind`.
     */
    bindings: VfRadioButtonBindings['wrapper']

    /**
     * Handles the input's blur event.
     *
     * @param e The native blur event.
     */
    handleBlur: (e: FocusEvent) => void

    /**
     * Handles the input's focus event.
     *
     * @param e The native focus event.
     */
    handleFocus: (e: FocusEvent) => void

    /**
     * Handles the input's change event, updating the model.
     *
     * @param payload The new input value.
     * @param e The originating native event.
     */
    handleInput: (payload: any, e?: Event) => void

    /**
     * Handles a native input event, updating the model from the event target.
     *
     * @param e The native input event.
     */
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   *
   * @param scope The text slot's params.
   */
  text: (scope: {
    /**
     * The resolved label text.
     */
    text: string | undefined

    /**
     * The element's unique ID.
     */
    id: string

    /**
     * The element's display name for accessibility.
     */
    genericName: string

    /**
     * The text element's resolved bindings (classes, part overrides); apply
     * with `v-bind`.
     */
    bindings: VfRadioButtonBindings['text']
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
export interface VfCloneNameExpose extends RadioButtonExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
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
  VfRadioButtonModifiers,
  VfRadioButtonA11y,
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
const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

const radioValue = propRefs.value as Ref<TRadioValue> // @todo: look into if it's possible to remove this from all comps

const {
  model,
  value,
  id,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  inputName,
  text,
  inputRef,
  genericName,
  forwardProps,
  forwardSlots,
  handleBlur,
  handleFocus,
  handleInput,
  handleModelUpdate,
} = api

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(() => ({
  root: 'vf-radio-button',
  wrapper: 'vf-choice-wrapper',
  text: 'vf-choice-text',
}))

useModifiers(({ props, hasError, help }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  wrapper: {
    'data-align': props.align || undefined,
    'data-aligned': props.aligned ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryPropOr,
  ResolvedBindings,
} from '@vueform/primevue'

type VfRadioButtonBindings = ResolvedBindings<
  VfCloneNameParts,
  VfRadioButtonModifiers,
  VfRadioButtonA11y
>

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
        :input-name
        :id
        :disabled
        :input-ref="inputRef"
        :text
        :bindings="bindings.wrapper"
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
          :input-name
          :id
          :disabled
          :input-ref="inputRef"
          :text
          :bindings="bindings.wrapper"
          :handle-blur
          :handle-focus
          :handle-input
          :handle-model-update
        />
        <div v-else v-bind="bindings.wrapper">
          <RadioButton
            v-model="value"
            :name="inputName"
            :input-id="id"
            :value="radioValue"
            :disabled
            :readonly
            :invalid
            v-bind="{ ...bindings.input, ...forwardProps }"
            :ref="(el) => (inputRef = el)"
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
          <slot name="text" :text :id :generic-name :bindings="bindings.text">
            <component
              v-if="outlets?.text"
              :is="outlets.text"
              :text
              :id
              :generic-name
              :bindings="bindings.text"
            />
            <label v-else-if="text" :for="id" v-bind="bindings.text">
              {{ text }}
            </label>
            <label v-else class="sr-only" :for="id">{{ genericName }}</label>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
