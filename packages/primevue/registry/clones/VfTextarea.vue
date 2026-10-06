<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
/**
 * VfCloneName — a custom element created from Vueform's `textarea` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type LanguagesProp,
  vdomPrime,
  type AddonGroupParts,
  type AddonsParts,
  type AddonsSlots,
  type ClassValue,
  type DefineElementContext,
  type FloatLabelClasses,
  type FloatLabelParts,
  type FloatLabelSlots,
  type IconsParts,
  type IconsSlots,
  type IftaClasses,
  type IftaParts,
  type IftaSlots,
  type TranslateParts,
  type TranslateSlots,
  type WidenProps,
} from '@vueform/primevue'
import PrimeTextarea from 'primevue/textarea'
import type { WritableComputedRef } from 'vue'
import {
  blueprint,
  defaults,
  type TextareaApi,
  type TextareaClasses,
  type TextareaEmits,
  type TextareaExpose,
  type TextareaParts,
  type TextareaProps,
  type TextareaSlots,
} from '@vueform/primevue/blueprints/textarea'
import type { TextareaProps as PvTextareaProps } from 'primevue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextareaProps<
  '__TYPE__',
  TTranslate,
  TLanguages,
  VfCloneNameSlots<TTranslate, TLanguages>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages>>
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
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextareaEmits<
  VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages>>
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
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextareaSlots<VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages>>>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}

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
    TextareaParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    TranslateParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The textarea input element.
   *
   * @tag Textarea
   */
  input: PvTextareaProps
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
  extends TextareaClasses, FloatLabelClasses, IftaClasses {
  /**
   * The textarea input element.
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
export interface VfCloneNameExpose extends TextareaExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, TextareaProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  TextareaApi<TProps>
> {}

// Non-colliding tag: Vapor treats `<Textarea>` as native `<textarea>`.
const VdomPrimeTextarea = vdomPrime(PrimeTextarea)

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfCloneNameEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfCloneNameProps<TTranslate, TLanguages>>(),
  {
    ...defaults,
    type: '__TYPE__',
  }
)
const events = defineEvents<VfCloneNameEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfCloneNameSlots<TTranslate, TLanguages>>()

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
useClasses(({ help }) => ({
  root: {
    'vf-textarea': true,
    'vf-align-label': !help.value,
  },
}))

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  aria,
  input,
  name,
  tooltipModifiers,
  tooltipValue,
  invalid,
  forwardProps,
  forwardSlots,
  handleKeydown,
  handleKeyup,
  handleKeypress,
  handleInput,
  handleFocus,
  handleBlur,
} = api

/**
 * PrimeVue Textarea types `modelValue` as `string | null`. The element's
 * `value` is the active-language scalar (`string | number | null`), which is
 * the same runtime binding as before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<string | null>

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryLanguagesOf,
  EntryTranslateOf,
} from '@vueform/primevue'

type EntryProps<TEntry> = VfCloneNameProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
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
      <VdomPrimeTextarea
        :name
        :id
        :class="classes.input"
        v-model="inputValue"
        :placeholder
        :disabled
        :readonly
        :invalid
        fluid
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{
          ...aria,
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @keypress="handleKeypress"
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
      </VdomPrimeTextarea>
    </VfLayout>
  </slot>
</template>
