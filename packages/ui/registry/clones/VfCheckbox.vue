<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
/**
 * VfCloneName — a custom element created from Vueform's `checkbox` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  defineEvents,
  type AriaProp,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type WidenProps,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type CheckboxApi,
  type CheckboxClasses,
  type CheckboxEmits,
  type CheckboxExpose,
  type CheckboxParts,
  type CheckboxProps,
  type CheckboxSlots,
} from '@vueform/ui/blueprints/checkbox'
import type { Ref, VNode } from 'vue'

import '@vueform/ui/choice.css'

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
 * @see https://ui.vueform.com/guide/event-handlers
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
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxSlots<
  VfCloneNameContext<VfCloneNameProps<TTrueValue, TFalseValue>>
> {
  /**
   * Slot that replaces the default checkbox rendering. Receives input-specific
   * props.
   */
  default: (scope: {
    /**
     * The current model value.
     */
    model: TTrueValue | TFalseValue

    /**
     * The value used when the checkbox is checked.
     */
    trueValue: TTrueValue

    /**
     * The value used when the checkbox is unchecked.
     */
    falseValue: TFalseValue

    /**
     * The input's `name` attribute.
     */
    inputName: string

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * Whether the checkbox is disabled.
     */
    disabled: boolean

    /**
     * The input DOM element reference.
     */
    input: any

    /**
     * The checkbox label text.
     */
    text: string | undefined

    /**
     * ARIA attributes for the input.
     */
    aria: AriaProp

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
   * Slot that replaces the text/label portion of the checkbox.
   */
  text: (scope: {
    /**
     * The checkbox label text.
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
export interface VfCloneNameParts extends CheckboxParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The checkbox input element.
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
export interface VfCloneNameClasses extends CheckboxClasses {
  /**
   * The wrapper element surrounding the input and text.
   */
  wrapper: ClassValue

  /**
   * The checkbox input element.
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
export interface VfCloneNameExpose extends CheckboxExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
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

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => props.falseValue ?? false,
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

const trueValue = propRefs.trueValue as Ref<TTrueValue>
const falseValue = propRefs.falseValue as Ref<TFalseValue>

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
  root: 'vf-checkbox',
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
        :handle-model-update
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
          :handle-model-update
        />
        <div v-else :class="classes.wrapper" v-bind="parts.wrapper">
          <input
            type="checkbox"
            v-model="value"
            :name="inputName"
            :id
            :value="trueValue"
            :true-value
            :false-value
            :disabled
            :class="classes.input"
            v-bind="{
              ...aria,
              ...parts.input,
            }"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInput"
            :ref="(el) => (input = el)"
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
