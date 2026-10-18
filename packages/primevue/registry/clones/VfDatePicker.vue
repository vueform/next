<script
  setup
  lang="ts"
  generic="TSelectionMode extends DatePickerSelectionModeProp = undefined"
>
/**
 * VfCloneName — a custom element created from Vueform's `date-picker` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
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
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type DatePickerSelectionModeProp,
  type DatePickerApi,
  type DatePickerClasses,
  type DatePickerEmits,
  type DatePickerExpose,
  type DatePickerParts,
  type DatePickerProps,
  type DatePickerSlots,
  type forwards,
} from '@vueform/primevue/blueprints/date-picker'
import type { DatePickerProps as PvDatePickerProps } from 'primevue'
import PrimeDatePicker, {
  type DatePickerSlots as ADatePickerSlots,
} from 'primevue/datepicker'
import type { ComputedRef, WritableComputedRef } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> extends DatePickerProps<
  '__TYPE__',
  TSelectionMode,
  VfCloneNameSlots<TSelectionMode>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TSelectionMode>>
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
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> extends DatePickerEmits<
  VfCloneNameContext<VfCloneNameProps<TSelectionMode>>
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
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
>
  extends
    DatePickerSlots<VfCloneNameContext<VfCloneNameProps<TSelectionMode>>>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ ForwardedSlots<
      ADatePickerSlots,
      (typeof forwards.slots)[number]
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
    DatePickerParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The date picker input element.
   *
   * @tag DatePicker
   */
  input: PvDatePickerProps
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
  extends DatePickerClasses, FloatLabelClasses, IftaClasses {
  /**
   * The date picker input element.
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
export interface VfCloneNameExpose extends DatePickerExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, DatePickerProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  DatePickerApi<TProps>
> {}

const DatePicker = vdomPrime(PrimeDatePicker)

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfCloneNameEmits<TSelectionMode>>()

const props = withDefaults(defineProps<VfCloneNameProps<TSelectionMode>>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits<TSelectionMode>>()
const slots = defineSlots<VfCloneNameSlots<TSelectionMode>>()

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
const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(() => ({
  root: 'vf-date-picker',
}))

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  a11yBindings,
  input,
  name,
  tooltipModifiers,
  tooltipValue,
  invalid,
  selectionMode,
  minDate,
  maxDate,
  forwardProps,
  forwardSlots,
  handleFocus,
  handleBlur,
  handleInput,
} = api

/**
 * PrimeVue DatePicker types `modelValue` as `Date | Date[] | (Date | null)[]`.
 * The element's `value` is `string | string[] | null`, which is the same
 * runtime binding as before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<
  Date | Date[] | (Date | null)[] | null | undefined
>

/**
 * PrimeVue DatePicker types `selectionMode` as a hinted `'single' | 'multiple'
 *
 * | 'range'` string. The resolved ref is the same union — this assertion is
 *
 * type-only.
 */
const pickerSelectionMode = selectionMode as ComputedRef<
  'single' | 'multiple' | 'range' | undefined
>

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry, EntryPropOf } from '@vueform/primevue'

type EntrySelectionModeOf<TEntry> =
  EntryPropOf<TEntry, 'selectionMode'> extends infer M
    ? M extends DatePickerSelectionModeProp
      ? M
      : undefined
    : undefined

type EntryProps<TEntry> = VfCloneNameProps<EntrySelectionModeOf<TEntry>>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<EntrySelectionModeOf<TEntry>>,
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
    <VfLayout v-else>
      <DatePicker
        :name
        :input-id="id"
        :class="classes.input"
        v-model="inputValue"
        :selection-mode="pickerSelectionMode"
        :placeholder
        :disabled
        :readonly
        :invalid
        :min-date
        :max-date
        fluid
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{
          ...a11yBindings.input,
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @blur="(e: any) => handleBlur(e)"
        @focus="(e: any) => handleFocus(e)"
        @change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </DatePicker>
    </VfLayout>
  </slot>
</template>
