<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `button` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  layoutRegionBindings,
  showsHelp,
  useBlueprint,
  defineEvents,
  buildDescribedBy,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type PartBindings,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type ButtonApi,
  type ButtonClasses,
  type ButtonEmits,
  type ButtonExpose,
  type ButtonParts,
  type ButtonProps,
  type ButtonSlots,
} from '@vueform/ui/blueprints/button'
import { useAttrs, type VNode } from 'vue'

import '@vueform/ui/button.css'
import '@vueform/ui/animation.css'

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
 * @see https://ui.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits extends ButtonEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots extends ButtonSlots<VfCloneNameContext> {
  /**
   * Slot for content rendered before the label.
   */
  before: () => VNode[]

  /**
   * Default slot that replaces the button label content.
   *
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The resolved button label text.
     */
    text: string | undefined

    /**
     * The label text element's resolved bindings (part overrides); apply
     * with `v-bind`.
     */
    bindings: PartBindings<'text', VfCloneNameParts, VfButtonBindings>
  }) => VNode[]

  /**
   * Slot for content rendered after the label.
   */
  after: () => VNode[]
}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/ui').DomAttrsOf<'div'>
 *   component: import('@vueform/ui').PartOf<'VfCloneName'>
 *
 * @see https://ui.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends ButtonParts {
  /**
   * The root button or anchor element.
   *
   * @tag button | a
   */
  button: DomAttrsOf<'button' | 'a'>

  /**
   * The icon of the button.
   *
   * @tag i
   */
  icon: DomAttrsOf<'i'>

  /**
   * The text of the button.
   *
   * @tag span
   */
  text: DomAttrsOf<'span'>
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
export interface VfCloneNameClasses extends ButtonClasses {
  /**
   * The root button or anchor element.
   */
  button: ClassValue

  /**
   * The button label text element.
   */
  text: ClassValue

  /**
   * The button icon element.
   */
  icon: ClassValue
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
  VfButtonBindings,
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
const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
const classes = useClasses({
  root: 'vf-button',
  button: () => [
    {
      'vf-btn': true,
      [api.tokenClass]: !!api.tokenCss.value,
    },
    props.layout === false ? props.class : undefined,
  ],
  icon: () => ({
    'vf-btn-icon': true,
    [api.icon.value!]: !!api.icon.value,
  }),
  text: 'vf-btn-text',
})

const bindings = useBindings(
  {
    button: () => {
      const isLink = !!(api.href.value || api.to.value)

      return {
        'data-variant': api.props.variant,
        'data-severity': api.severity.value,
        'data-size': api.props.size,
        'data-align': api.props.align || undefined,
        'data-fluid': api.props.fluid ? '' : undefined,
        'data-icon-only': !!api.icon.value && !api.text.value ? '' : undefined,
        'data-loading': api.loading.value ? '' : undefined,
        // Anchor mode has no native `disabled` attribute, so the styling
        // state needs its own marker there; `<button>` keeps `:disabled`.
        'data-disabled': isLink && api.disabled.value ? '' : undefined,
        disabled: !isLink ? api.disabled.value || undefined : undefined,
        'aria-disabled': isLink ? api.disabled.value || undefined : undefined,
        'aria-busy': api.loading.value || undefined,
        'aria-label':
          api.icon.value && !api.text.value ? api.genericName.value : undefined,
        'aria-describedby': buildDescribedBy([
          showsHelp(api) ? api.helpId.value : null,
          api.description.value ? api.descriptionId.value : null,
          api.displayErrors.value?.length ? api.errorId.value : null,
        ]),
      }
    },
    icon: () => ({
      'data-pos': api.props.iconPos,
    }),
  },
  layoutRegionBindings(api)
)

const { viewLoaded, text, href, to, id, tokenCss, icon, nonce, handleClick } =
  api

const { target, rel, download } = propRefs

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry } from '@vueform/ui'

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
    <VfLayout v-else :addons="false">
      <component
        :is="href || to ? 'a' : 'button'"
        :type="href || to ? undefined : 'button'"
        :id
        :href="href || to"
        :target
        :rel
        :download
        :class="classes.button"
        v-bind="{ ...bindings.button(), ...attrs }"
        @click="handleClick"
      >
        <i
          v-if="icon"
          aria-hidden="true"
          :class="classes.icon"
          v-bind="bindings.icon()"
        />
        <slot name="before">
          <component v-if="outlets?.before" :is="outlets.before" />
        </slot>
        <slot :text :bindings="bindings.text()">
          <component
            v-if="outlets?.default"
            :is="outlets.default"
            :text
            :bindings="bindings.text()"
          />
          <span v-else-if="text" :class="classes.text" v-bind="bindings.text()">
            {{ text }}
          </span>
        </slot>
        <slot name="after">
          <component v-if="outlets?.after" :is="outlets.after" />
        </slot>
      </component>
      <component v-if="tokenCss" :is="'style'" :nonce.attr="nonce">
        {{ tokenCss }}
      </component>
    </VfLayout>
  </slot>
</template>
