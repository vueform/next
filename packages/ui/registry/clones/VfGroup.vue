<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `group` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  defineEvents,
  schemaEntries,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type ResolvedSchema,
  type WidenProps,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type GroupApi,
  type GroupClasses,
  type GroupEmits,
  type GroupExpose,
  type GroupParts,
  type GroupProps,
  type GroupSlots,
} from '@vueform/ui/blueprints/group'

import '@vueform/ui/group.css'
import type { VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps extends GroupProps<
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
export interface VfCloneNameEmits extends GroupEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots extends GroupSlots<VfCloneNameContext> {
  /**
   * Slot that replaces the wrapper element. Receives the wrapper class and
   * resolved schema.
   */
  wrapper: (scope: {
    /**
     * CSS classes for the wrapper element.
     */
    class: ClassValue

    /**
     * The resolved schema of the group's child elements.
     */
    resolvedSchema: ResolvedSchema

    /**
     * The group's resolved label.
     */
    label?: string
  }) => VNode[]

  /**
   * Slot that replaces the default content. Receives the resolved schema for
   * rendering children.
   */
  default: (scope: {
    /**
     * The resolved schema of the group's child elements.
     */
    resolvedSchema: ResolvedSchema
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
export interface VfCloneNameParts extends GroupParts {
  /**
   * The wrapper element containing child elements.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>
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
export interface VfCloneNameClasses extends GroupClasses {
  /**
   * The wrapper element containing child elements.
   */
  wrapper: ClassValue
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
export interface VfCloneNameExpose extends GroupExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, GroupProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  GroupApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  children: (props) => ({
    flat: props.nested !== true,
    entries: Object.fromEntries(schemaEntries(props.schema)),
  }),
})
defineEmits<VfCloneNameEmits>()

const props = withDefaults(defineProps<VfCloneNameProps>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits>()
const slots = defineSlots<VfCloneNameSlots>()

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
const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
useClasses(({ props }) => ({
  root: {
    'vf-group': true,
    'vf-wrapped': props.wrap,
  },
  wrapper: [
    props.layout === false ? props.class : null,
    {
      'vf-group-elements': true,
      'vf-stacked': props.stacked,
      'vf-wrapped': props.innerWrap,
    },
  ],
}))

const { resolvedSchema, label } = api

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryPropOf,
  EntrySchemaOf,
  IsAny,
  ObjectModel,
  SchemaToModel,
} from '@vueform/ui'

type GroupModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'nested'>> extends true
    ? ObjectModel
    : SchemaToModel<EntrySchemaOf<TEntry>>

type EntryProps<TEntry> = Omit<VfCloneNameProps, 'modelValue'> & {
  modelValue?: GroupModelOf<TEntry>
}

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits,
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
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <slot
        name="wrapper"
        :resolved-schema
        :label
        :class="classes.wrapper"
        v-bind="parts.wrapper"
      >
        <component
          v-if="outlets?.wrapper"
          :is="outlets.wrapper"
          :resolved-schema
          :parts
          :classes
          :class="classes.wrapper"
          v-bind="parts.wrapper"
        />
        <div v-else :class="classes.wrapper" v-bind="parts.wrapper">
          <slot :resolved-schema>
            <component
              v-if="outlets?.default"
              :is="outlets.default"
              :resolved-schema
            />
            <template v-else>
              <component
                v-for="el in resolvedSchema"
                :key="el.props.name"
                :is="el.component"
                v-bind="el.props"
              />
            </template>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
