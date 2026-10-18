<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
/**
 * VfCloneName — a custom element created from Vueform's `toggle-switch` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  vdomPrime,
  type ClassValue,
  type DefineElementContext,
  type ForwardedSlots,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type ToggleSwitchApi,
  type ToggleSwitchClasses,
  type ToggleSwitchEmits,
  type ToggleSwitchExpose,
  type ToggleSwitchParts,
  type ToggleSwitchProps,
  type ToggleSwitchSlots,
  type forwards,
} from '@vueform/primevue/blueprints/toggle-switch'
import type { ToggleSwitchProps as PvToggleSwitchProps } from 'primevue'
import PrimeToggleSwitch, {
  type ToggleSwitchSlots as AToggleSwitchSlots,
} from 'primevue/toggleswitch'

import '@vueform/primevue/toggle-switch.css'
import type { Ref, WritableComputedRef, VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TTrueValue = true,
  TFalseValue = false,
> extends ToggleSwitchProps<
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
  TTrueValue = true,
  TFalseValue = false,
> extends ToggleSwitchEmits<
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
export interface VfCloneNameSlots<TTrueValue = true, TFalseValue = false>
  extends
    ToggleSwitchSlots<
      VfCloneNameContext<VfCloneNameProps<TTrueValue, TFalseValue>>
    >,
    /* @vue-ignore */ ForwardedSlots<
      AToggleSwitchSlots,
      (typeof forwards.slots)[number]
    > {
  /**
   * Custom handle template.
   *
   * @param scope The handle slot's params.
   */
  handle(scope: {
    /**
     * Current checked state of the item as a boolean.
     */
    checked: boolean
  }): VNode[]
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
export interface VfCloneNameParts extends ToggleSwitchParts {
  /**
   * The toggle switch element.
   *
   * @tag ToggleSwitch
   */
  input: PvToggleSwitchProps
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
export interface VfCloneNameClasses extends ToggleSwitchClasses {
  /**
   * The toggle switch element.
   */
  input: ClassValue

  /**
   * The switch handle icon element.
   */
  handle: ClassValue
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
export interface VfCloneNameExpose extends ToggleSwitchExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, ToggleSwitchProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  ToggleSwitchApi<TProps>
> {}

const ToggleSwitch = vdomPrime(PrimeToggleSwitch)

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
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(() => ({
  root: 'vf-toggle-switch',
  handle: {
    'vf-toggle-switch-handle': true,
    [api.onIcon.value!]: api.checked.value && api.onIcon.value,
    [api.offIcon.value!]: !api.checked.value && api.offIcon.value,
  },
}))

const trueValue = propRefs.trueValue as Ref<TTrueValue>
const falseValue = propRefs.falseValue as Ref<TFalseValue>

const {
  value,
  name,
  id,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  input,
  forwardProps,
  forwardSlots,
  handleInput,
  handleBlur,
  handleFocus,
  a11yBindings,
} = api

/**
 * PrimeVue ToggleSwitch types `modelValue` as `string | boolean`. The element's
 * `value` is `TTrueValue | TFalseValue`, which is the same runtime binding as
 * before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<string | boolean>

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
    <VfLayout v-else>
      <ToggleSwitch
        :name
        :class="classes.input"
        v-model="inputValue"
        :input-id="id"
        :true-value
        :false-value
        :disabled
        :readonly
        :invalid
        v-bind="{
          ...a11yBindings.input,
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
        <template #handle="scope">
          <slot name="handle" v-bind="scope">
            <component
              v-if="outlets.handle"
              :is="outlets.handle"
              v-bind="scope"
            />
            <template v-else>
              <i :class="classes.handle" />
            </template>
          </slot>
        </template>
      </ToggleSwitch>
    </VfLayout>
  </slot>
</template>
