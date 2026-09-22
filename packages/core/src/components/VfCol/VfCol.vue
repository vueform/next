<script setup lang="ts">
import { defaults, blueprint } from '~/blueprints/col'
import { useBlueprint } from '~/composables'
import { defineEvents } from '~/helpers'
import type { VfColEmits, VfColProps, VfColSlots } from './types'

defineOptions({ name: 'VfCol', inheritAttrs: false })
defineEmits<VfColEmits>()

const props = withDefaults(defineProps<VfColProps>(), defaults)
const events = defineEvents<VfColEmits>()
const slots = defineSlots<VfColSlots>()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: ({
    align,
    valign,
    colHeader,
    rowHeader,
  }: {
    align: string
    valign: string
    colHeader: boolean
    rowHeader: boolean
  }) => ({
    'vf-grid-cell': true,
    [`vf-${align}`]: !!align,
    [`vf-${valign}`]: !!align,
    'vf-grid-col-header': colHeader,
    'vf-grid-row-header': rowHeader,
  }),
}))

const {
  align,
  valign,
  cell,
  cellCss,
  colspan,
  rowspan,
  colHeader,
  rowHeader,
  nonce,
  uid,
} = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div
      v-if="!template"
      :class="classes.root({ align, valign, colHeader, rowHeader })"
      :data-col-id="uid"
      :data-col="cell?.col"
      :data-row="cell?.row"
      :data-col-start="cell?.colStart"
      :data-col-end="cell?.colEnd"
      :data-row-start="cell?.rowStart"
      :data-row-end="cell?.rowEnd"
      :data-colspan="colspan"
      :data-rowspan="rowspan"
      v-bind="parts.root"
    >
      <slot>
        <component v-if="outlets?.default" :is="outlets.default" />
      </slot>
    </div>
    <component v-if="cellCss" :is="'style'" :nonce.attr="nonce">
      {{ cellCss }}
    </component>
  </slot>
</template>
