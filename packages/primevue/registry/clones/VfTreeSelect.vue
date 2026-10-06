<script
  setup
  lang="ts"
  generic="
    TOptions extends TreeOptionsProp = TreeOptionsProp,
    TSelectionMode extends TreeSelectionModeProp = undefined,
    TModel = any
  "
>
/**
 * VfCloneName — a custom element created from Vueform's `tree-select` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type TreeSelectionModeProp,
  vdomPrime,
  type TreeOptionsProp,
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
  type OverrideSlots,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type TreeSelectApi,
  type TreeSelectClasses,
  type TreeSelectEmits,
  type TreeSelectExpose,
  type TreeSelectParts,
  type TreeSelectProps,
  type TreeSelectSlots,
  type forwards,
} from '@vueform/primevue/blueprints/tree-select'
import type { TreeSelectProps as PvTreeSelectProps } from 'primevue'
import PrimeTreeSelect, {
  type TreeSelectSlots as ATreeSelectSlots,
} from 'primevue/treeselect'
import type { VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
> extends TreeSelectProps<
  '__TYPE__',
  TOptions,
  TSelectionMode,
  TModel,
  VfCloneNameSlots<TOptions, TSelectionMode, TModel>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TOptions, TSelectionMode, TModel>>
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
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
> extends TreeSelectEmits<
  VfCloneNameContext<VfCloneNameProps<TOptions, TSelectionMode, TModel>>
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
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
>
  extends
    TreeSelectSlots<
      VfCloneNameContext<VfCloneNameProps<TOptions, TSelectionMode, TModel>>
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<ATreeSelectSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom selected value display.
         */
        value: (props: {
          /**
           * Selected tree nodes for display.
           */
          value: any

          /**
           * Placeholder prop value.
           */
          placeholder: string
        }) => VNode[]

        /**
         * Custom content for each tree node option.
         */
        option: (props: {
          /**
           * Current tree node.
           */
          node: any

          /**
           * Selection state.
           */
          selected: boolean

          /**
           * Expanded state.
           */
          expanded: boolean
        }) => VNode[]

        /**
         * Custom header template of the overlay panel.
         */
        header: (props: {
          /**
           * Selected keys map of the component.
           */
          value: any

          /**
           * An array of tree nodes.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template of the overlay panel.
         */
        footer: (props: {
          /**
           * Selected keys map of the component.
           */
          value: any

          /**
           * An array of tree nodes.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom toggle icon for a tree node.
         */
        itemtoggleicon: (props: {
          /**
           * Current tree node.
           */
          node: any

          /**
           * Whether the node is expanded.
           */
          expanded: boolean

          /**
           * Style class of the icon.
           */
          class: string
        }) => VNode[]
      }
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
    TreeSelectParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The tree-select input element.
   *
   * @tag TreeSelect
   */
  input: PvTreeSelectProps
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
  extends TreeSelectClasses, FloatLabelClasses, IftaClasses {
  /**
   * The tree-select input element.
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
export interface VfCloneNameExpose extends TreeSelectExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<
    VfCloneNameProps,
    TreeSelectProps<string, TreeOptionsProp, TreeSelectionModeProp>
  > = VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  TreeSelectApi<TProps>
> {}

const TreeSelect = vdomPrime(PrimeTreeSelect)

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfCloneNameEmits<TOptions, TSelectionMode, TModel>>()

const props = withDefaults(
  defineProps<VfCloneNameProps<TOptions, TSelectionMode, TModel>>(),
  {
    ...defaults,
    type: '__TYPE__',
  }
)
const events =
  defineEvents<VfCloneNameEmits<TOptions, TSelectionMode, TModel>>()
const slots = defineSlots<VfCloneNameSlots<TOptions, TSelectionMode, TModel>>()

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
    'vf-tree-select': true,
    'vf-align-label': !help.value,
  },
}))

const {
  value,
  id,
  placeholder,
  viewLoaded,
  disabled,
  loading,
  resolving,
  aria,
  input,
  name,
  invalid,
  items,
  forwardProps,
  forwardSlots,
  handleFocus,
  handleBlur,
  handleInput,
} = api

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryPropOf,
  UnwrapEntryRef,
} from '@vueform/primevue'

type EntryTreeOptionsOf<TEntry> =
  EntryPropOf<TEntry, 'options'> extends infer I
    ? [I] extends [undefined]
      ? TreeOptionsProp
      : UnwrapEntryRef<I> extends infer U extends TreeOptionsProp
        ? U
        : TreeOptionsProp
    : TreeOptionsProp

type EntrySelectionModeOf<TEntry> =
  EntryPropOf<TEntry, 'selectionMode'> extends infer M
    ? M extends TreeSelectionModeProp
      ? M
      : undefined
    : undefined

type EntryProps<TEntry> = VfCloneNameProps<
  EntryTreeOptionsOf<TEntry>,
  EntrySelectionModeOf<TEntry>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<
        EntryTreeOptionsOf<TEntry>,
        EntrySelectionModeOf<TEntry>
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
      <TreeSelect
        :name
        :id
        :class="classes.input"
        v-model="value"
        :options="items"
        :placeholder
        :disabled
        :loading="loading || resolving"
        :invalid
        fluid
        v-bind="{
          ...aria,
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </TreeSelect>
    </VfLayout>
  </slot>
</template>
