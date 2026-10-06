<script setup lang="ts">
/**
 * Local copy of VfGrid of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfGridEmits,
  type VfGridProps,
  type VfGridSlots,
} from '@vueform/ui/components/VfGrid'

import '@vueform/ui/grid.css'
import '@vueform/ui/tabular.css'

defineOptions({
  name: 'VfGrid',
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
defineEmits<VfGridEmits>()

const props = withDefaults(defineProps<VfGridProps>(), defaults)
const events = defineEvents<VfGridEmits>()
const slots = defineSlots<VfGridSlots>()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props, fitWidth, gridClass }) => ({
  root: {
    'vf-grid': true,
    'vf-tabular': !!props.tabular,
    'vf-wrap-col-headers': !!props.wrapColHeaders,
    'vf-wrap-row-headers': !!props.wrapRowHeaders,
  },
  wrapper: {
    'vf-grid-wrapper': true,
    'vf-scrollable': !!props.scrollable,
  },
  grid: {
    'vf-grid-grid': true,
    'vf-fit': !!fitWidth.value,
    [gridClass.value]: true,
  },
  cell: ({
    align,
    valign,
    colHeader,
    rowHeader,
  }: {
    align: string
    valign: string
    schema?: unknown
    colHeader?: boolean
    rowHeader?: boolean
  }) => ({
    'vf-grid-cell': true,
    'vf-left': align === 'left',
    'vf-center': align === 'center',
    'vf-right': align === 'right',
    'vf-justify': align === 'justify',
    'vf-top': valign === 'top',
    'vf-middle': valign === 'middle',
    'vf-bottom': valign === 'bottom',
    'vf-baseline': valign === 'baseline',
    'vf-grid-col-header': !!colHeader,
    'vf-grid-row-header': !!rowHeader,
  }),
}))

const { tabular } = propRefs

const { gridCss, nonce, cells } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <div :class="classes.wrapper">
        <div :class="classes.grid" v-bind="parts.grid">
          <slot :cells>
            <component v-if="outlets?.default" :is="outlets.default" :cells />
            <template v-else>
              <div
                v-for="cell in cells"
                :class="classes.cell(cell)"
                :data-col="cell.col"
                :data-row="cell.row"
                :data-col-start="cell.colStart"
                :data-col-end="cell.colEnd"
                :data-row-start="cell.rowStart"
                :data-row-end="cell.rowEnd"
                :data-last-col="cell.lastCol"
                :data-last-row="cell.lastRow"
                v-bind="{
                  ...cell.attrs,
                  ...parts.cell?.(cell),
                }"
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
