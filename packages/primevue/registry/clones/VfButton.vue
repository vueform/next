<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `button` blueprint.
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
} from '@vueform/primevue'
import PrimeButton from 'primevue/button'
import { useAttrs } from 'vue'
import {
  blueprint,
  defaults,
  type ButtonApi,
  type ButtonClasses,
  type ButtonEmits,
  type ButtonExpose,
  type ButtonParts,
  type ButtonProps,
  type ButtonSlots,
  type forwards,
} from '@vueform/primevue/blueprints/button'
import '@vueform/primevue/button.css'
import type {
  ButtonSlots as AButtonSlots,
  ButtonProps as PvButtonProps,
} from 'primevue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps extends ButtonProps<
  '__TYPE__',
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits extends ButtonEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots
  extends
    ButtonSlots<VfCloneNameContext>,
    /* @vue-ignore */ ForwardedSlots<
      AButtonSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfCloneName'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends ButtonParts {
  /**
   * The PrimeVue Button component.
   *
   * @tag Button
   */
  button: PvButtonProps
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
export interface VfCloneNameClasses extends ButtonClasses {
  /**
   * The PrimeVue Button component.
   */
  button: ClassValue
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
export interface VfCloneNameExpose extends ButtonExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext extends DefineElementContext<
  VfCloneNameProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  ButtonApi
> {}

defineOptions({ name: 'VfCloneName', element: true, inheritAttrs: false })
defineEmits<VfCloneNameEmits>()

const props = withDefaults(defineProps<VfCloneNameProps>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits>()
const slots = defineSlots<VfCloneNameSlots>()
const attrs = useAttrs()

// Non-colliding tag: Vapor treats `<Button>` as native `<button>`.
const PvButton = vdomPrime(PrimeButton)

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
useClasses(({ help }) => ({
  root: {
    'vf-button': true,
    'vf-align-label': !help.value,
  },
  button: [
    props.layout === false ? props.class : null,
    {
      [api.tokenClass]: !!api.tokenCss.value,
      'vf-left': props.align === 'left',
      'vf-right': props.align === 'right',
      'vf-center': props.align === 'center',
    },
  ],
}))

const { target, rel, download, fluid } = propRefs

const {
  viewLoaded,
  text,
  icon,
  severity,
  badge,
  badgeSeverity,
  loading,
  disabled,
  tokenCss,
  href,
  as,
  tooltipModifiers,
  tooltipValue,
  forwardSlots,
  nonce,
  handleClick,
} = api

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry } from '@vueform/primevue'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      VfCloneNameProps,
      VfCloneNameEmits,
      VfCloneNameSlots,
      VfCloneNameParts,
      VfCloneNameClasses,
      VfCloneNameContext
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
    <VfLayout v-else :addons="false" :loading="false">
      <PvButton
        :label="text"
        :icon
        :loading
        :fluid
        :disabled
        :href
        :target
        :rel
        :as
        :download
        :severity
        :badge
        :badge-severity="badgeSeverity"
        :class="classes.button"
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{
          ...parts.button,
          ...attrs,
        }"
        @click="handleClick"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </PvButton>
      <component v-if="tokenCss" :is="'style'" :nonce.attr="nonce">
        {{ tokenCss }}
      </component>
    </VfLayout>
  </slot>
</template>
