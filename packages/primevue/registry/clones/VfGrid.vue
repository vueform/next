<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `grid` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  defineEvents,
  type AlignProp,
  type ValignProp,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type WidenProps,
} from '@vueform/primevue'
import {
  defaults,
  blueprint,
  type GridApi,
  type GridCell,
  type GridClasses,
  type GridEmits,
  type GridExpose,
  type GridParts,
  type GridProps,
  type GridSlots,
} from '@vueform/primevue/blueprints/grid'

import '@vueform/primevue/grid.css'
import type { VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps extends GridProps<
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
export interface VfCloneNameEmits extends GridEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots extends GridSlots<VfCloneNameContext> {
  /**
   * Slot that replaces the default grid content. Receives the resolved grid
   * cells.
   */
  default: (scope: {
    /**
     * The resolved grid cells.
     */
    cells: GridCell[]
  }) => VNode[]

  /**
   * Slot that replaces each individual grid cell rendering.
   */
  cell: (scope: {
    /**
     * The resolved grid cell.
     */
    cell: GridCell
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
export interface VfCloneNameParts extends GridParts {
  /**
   * The scrollable wrapper around the grid layout element.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The grid layout element.
   *
   * @tag div
   */
  grid: DomAttrsOf<'div'>

  /**
   * Each cell element. Receives alignment, schema, and header options.
   *
   * @param options Alignment, optional schema, and header flags for this cell.
   * @tag div
   */
  cell: (options: {
    align: AlignProp
    valign: ValignProp
    schema?: any
    colHeader?: boolean
    rowHeader?: boolean
  }) => DomAttrsOf<'div'>
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
export interface VfCloneNameClasses extends GridClasses {
  /**
   * The grid wrapper element.
   */
  wrapper: ClassValue

  /**
   * The grid layout element.
   */
  grid: ClassValue

  /**
   * Each cell element. Receives alignment, schema, and header options.
   *
   * @param options Alignment, optional schema, and header flags for this cell.
   */
  cell: (options: {
    /**
     * The cell's horizontal alignment.
     */
    align: AlignProp

    /**
     * The cell's vertical alignment.
     */
    valign: ValignProp

    /**
     * The element schema rendered in the cell, if any.
     */
    schema?: any

    /**
     * Whether the cell is a column header.
     */
    colHeader?: boolean

    /**
     * Whether the cell is a row header.
     */
    rowHeader?: boolean
  }) => ClassValue
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
export interface VfCloneNameExpose extends GridExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, GridProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfGridModifiers,
  VfGridA11y,
  VfCloneNameExpose,
  GridApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  children: (props) => {
    const entries: Record<string, Record<string, any>> = {}
    const grid = (props.grid ?? []) as readonly (readonly any[])[]

    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell || typeof cell !== 'object' || !('type' in cell)) return

        const {
          colspan: _colspan,
          rowspan: _rowspan,
          align: _align,
          valign: _valign,
          attrs: _attrs,
          content: _content,
          ...schema
        } = cell as Record<string, any>

        const name = schema.name ?? `${props.name}_${r}_${c}`
        entries[String(name)] = schema
      })
    })

    return { flat: props.nested !== true, entries }
  },
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
} = useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(({ props, fitWidth, gridClass }) => ({
  root: {
    'vf-grid': true,
    'vf-tabular': !!props.tabular,
    'vf-wrap-col-headers': !!props.wrapColHeaders,
    'vf-wrap-row-headers': !!props.wrapRowHeaders,
  },
  wrapper: 'vf-grid-wrapper',
  grid: {
    'vf-grid-grid': true,
    [gridClass.value]: true,
  },
  cell: ({
    colHeader,
    rowHeader,
  }: {
    schema?: unknown
    colHeader?: boolean
    rowHeader?: boolean
  }) => ({
    'vf-grid-cell': true,
    'vf-grid-col-header': !!colHeader,
    'vf-grid-row-header': !!rowHeader,
  }),
}))

useModifiers(({ props, fitWidth }) => ({
  wrapper: {
    'data-scrollable': props.scrollable ? '' : undefined,
  },
  grid: {
    'data-fit': fitWidth.value ? '' : undefined,
  },
  cell: (cell: { align: AlignProp; valign: ValignProp }) => ({
    'data-align': cell.align || undefined,
    'data-valign': cell.valign || undefined,
  }),
}))

const { tabular } = propRefs

const { gridCss, nonce, cells } = api

defineExpose(expose)
</script>

<script lang="ts">
import type {
  BindingsOf,
  DefineRegistryEntry,
  EntryPropOf,
  GridToSchema,
  IsAny,
  ObjectModel,
  SchemaToModel,
} from '@vueform/primevue'
import type { Ref } from 'vue'

type VfGridBindings = BindingsOf<
  VfCloneNameParts,
  VfCloneNameClasses,
  VfGridModifiers,
  VfGridA11y
>

type EntryGridOf<TEntry> =
  EntryPropOf<TEntry, 'grid'> extends infer G
    ? G extends Ref<infer V>
      ? V
      : G
    : undefined

type GridModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'nested'>> extends true
    ? ObjectModel
    : EntryGridOf<TEntry> extends infer G
      ? [G] extends [undefined]
        ? ObjectModel
        : SchemaToModel<GridToSchema<G>>
      : ObjectModel

type EntryProps<TEntry> = Omit<VfCloneNameProps, 'modelValue'> & {
  modelValue?: GridModelOf<TEntry>
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
      <div v-bind="bindings.wrapper">
        <div v-bind="bindings.grid">
          <slot :cells>
            <component v-if="outlets?.default" :is="outlets.default" :cells />
            <template v-else>
              <div
                v-for="cell in cells"
                :key="cell.key"
                :data-col="cell.col"
                :data-row="cell.row"
                :data-col-start="cell.colStart"
                :data-col-end="cell.colEnd"
                :data-row-start="cell.rowStart"
                :data-row-end="cell.rowEnd"
                :data-last-col="cell.lastCol"
                :data-last-row="cell.lastRow"
                v-bind="{ ...bindings.cell(cell), ...cell.attrs }"
              >
                <slot name="cell" :cell>
                  <component v-if="outlets?.cell" :is="outlets.cell" :cell />
                  <component
                    v-else-if="cell.component"
                    :is="cell.component"
                    :key="cell.key"
                    v-bind="cell.props"
                    :layout="!tabular"
                  />
                </slot>
              </div>
            </template>
          </slot>
        </div>
      </div>
      <component :is="'style'" :nonce.attr="nonce">
        {{ gridCss }}
      </component>
    </VfLayout>
  </slot>
</template>
