<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp,
    TNullValue = [TTranslate] extends [true] ? string | number | null : any
  "
>
/**
 * VfCloneName — a custom element created from Vueform's `field` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  inputAria,
  useBlueprint,
  defineEvents,
  type LanguagesProp,
  type AddonGroupClasses,
  type AddonsParts,
  type AddonsSlots,
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
  type FieldApi,
  type FieldClasses,
  type FieldEmits,
  type FieldExpose,
  type FieldParts,
  type FieldProps,
  type FieldSlots,
} from '@vueform/ui/blueprints/field'

import '@vueform/ui/input.css'
import type { VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> extends FieldProps<
  '__TYPE__',
  TTranslate,
  TLanguages,
  TNullValue,
  VfCloneNameSlots<TTranslate, TLanguages, TNullValue>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages, TNullValue>>
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
  TNullValue = any,
> extends FieldEmits<
  VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages, TNullValue>>
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
  TNullValue = any,
>
  extends
    FieldSlots<
      VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages, TNullValue>>
    >,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {
  /**
   * Default slot where the user renders their 3rd party component. Receives the
   * full component context.
   *
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The component's context.
     */
    context: VfCloneNameContext<
      VfCloneNameProps<TTranslate, TLanguages, TNullValue>
    >
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
export interface VfCloneNameParts
  extends FieldParts, AddonsParts, IconsParts, TranslateParts {
  /**
   * The user-rendered control. VfCloneName does not render it — the default slot
   * supplies the markup and applies `bindings.input` (ARIA state and part
   * overrides) to whichever element acts as the control.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>

  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>
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
  extends FieldClasses, AddonGroupClasses, IconsClasses {}

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
export interface VfCloneNameExpose extends FieldExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, FieldProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfFieldBindings,
  VfCloneNameExpose,
  FieldApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => props.nullValue ?? null,
})
defineEmits<VfCloneNameEmits<TTranslate, TLanguages, TNullValue>>()

const props = withDefaults(
  defineProps<VfCloneNameProps<TTranslate, TLanguages, TNullValue>>(),
  {
    ...defaults,
    type: '__TYPE__',
  }
)
const events =
  defineEvents<VfCloneNameEmits<TTranslate, TLanguages, TNullValue>>()
const slots =
  defineSlots<VfCloneNameSlots<TTranslate, TLanguages, TNullValue>>()

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
const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
useClasses({
  root: 'vf-field',
})

useBindings(inputAria(api))

const { viewLoaded } = api

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryLanguagesOf,
  EntryPropOr,
  EntryTranslateOf,
} from '@vueform/ui'

type EntryNullValueOf<TEntry> = EntryPropOr<
  TEntry,
  'nullValue',
  [EntryTranslateOf<TEntry>] extends [true] ? string | number | null : any
>

type EntryProps<TEntry> = VfCloneNameProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>,
  EntryNullValueOf<TEntry>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<
        EntryTranslateOf<TEntry>,
        EntryLanguagesOf<TEntry>,
        EntryNullValueOf<TEntry>
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
    <VfLayout v-else>
      <slot :context>
        <component v-if="outlets?.default" :is="outlets.default" :context />
      </slot>
    </VfLayout>
  </slot>
</template>
