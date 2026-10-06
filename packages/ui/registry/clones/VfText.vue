<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
/**
 * VfCloneName — a custom element created from Vueform's `text` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  type LanguagesProp,
  useBlueprint,
  defineEvents,
  type AddonGroupClasses,
  type AddonGroupParts,
  type AddonsParts,
  type AddonsSlots,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type IconsClasses,
  type IconsParts,
  type IconsSlots,
  type TranslateParts,
  type TranslateSlots,
  type WidenProps,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type TextApi,
  type TextClasses,
  type TextEmits,
  type TextExpose,
  type TextParts,
  type TextProps,
  type TextSlots,
} from '@vueform/ui/blueprints/text'
import '@vueform/ui/input.css'
import '@vueform/ui/text.css'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextProps<
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
 * @see https://ui.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextEmits<
  VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages>>
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
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextSlots<VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages>>>,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/ui').DomAttrsOf<'div'>
 *   component: import('@vueform/ui').PartOf<'VfButton'>
 *
 * @see https://ui.vueform.com/guide/parts
 */
export interface VfCloneNameParts
  extends TextParts, AddonsParts, AddonGroupParts, IconsParts, TranslateParts {
  /**
   * The text input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>
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
export interface VfCloneNameClasses
  extends TextClasses, AddonGroupClasses, IconsClasses {
  /**
   * The text input element.
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
 * @see https://ui.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends TextExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, TextProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  TextApi<TProps>
> {}

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
 * @see https://ui.vueform.com/guide/components#extending-the-logic
 */
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
useClasses(({ help, hasError }) => ({
  root: {
    'vf-text': true,
    'vf-align-label': !help.value,
  },
  input: {
    'vf-input': true,
    'vf-text-input': true,
    'vf-danger': hasError.value,
  },
}))

const {
  value,
  id,
  loading,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  aria,
  input,
  name,
  handleKeydown,
  handleKeyup,
  handleKeypress,
  handleFocus,
  handleBlur,
  handleInput,
} = api

const { inputType, autocomplete } = propRefs

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryLanguagesOf,
  EntryTranslateOf,
} from '@vueform/ui'

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
    <VfLayout v-else :loading>
      <input
        :type="inputType"
        :name
        :id
        :class="classes.input"
        v-model="value"
        :placeholder
        :autocomplete
        :disabled
        :readonly="readonly || undefined"
        v-bind="{
          ...aria,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @keypress="handleKeypress"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />
    </VfLayout>
  </slot>
</template>
