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
  inputAria,
  vdomPrime,
  type ClassValue,
  type DefineElementContext,
  type ForwardedSlots,
  type WidenProps,
} from '@vueform/primevue'
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
import PrimeCheckbox, {
  type CheckboxSlots as ACheckboxSlots,
  type CheckboxProps as PvCheckboxProps,
} from 'primevue/checkbox'
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
    bindings: VfCheckboxBindings['wrapper']

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
     * Handles a native input event and updates the model from the event target.
     *
     * @param data The native DOM event from the input.
     */
    handleModelUpdate: (data: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the checkbox.
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
    bindings: VfCheckboxBindings['text']
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
  VfCheckboxModifiers,
  VfCheckboxA11y,
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

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(() => ({
  root: 'vf-checkbox',
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

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryPropOr,
  ResolvedBindings,
} from '@vueform/primevue'

type VfCheckboxBindings = ResolvedBindings<
  VfCloneNameParts,
  VfCheckboxModifiers,
  VfCheckboxA11y
>

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
        :input-name
        :id
        :true-value
        :false-value
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
          :input-name
          :id
          :true-value
          :false-value
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
          <Checkbox
            :name="inputName"
            :input-id="id"
            v-model="value"
            :true-value
            :false-value
            :disabled
            :readonly
            :invalid
            binary
            v-bind="{ ...bindings.input, ...forwardProps }"
            :ref="(el) => (inputRef = el)"
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
