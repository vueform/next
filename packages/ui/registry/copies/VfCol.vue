<script setup lang="ts">
/**
 * Local copy of VfCol of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfColEmits,
  type VfColProps,
  type VfColSlots,
} from '@vueform/ui/components/VfCol'

import '@vueform/ui/grid.css'

defineOptions({ name: 'VfCol', inheritAttrs: false })
defineEmits<VfColEmits>()

const props = withDefaults(defineProps<VfColProps>(), defaults)
const events = defineEvents<VfColEmits>()
const slots = defineSlots<VfColSlots>()

const { api, context, expose, outlets, bindings, useClasses, useModifiers } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ colHeader, rowHeader }) => ({
  root: {
    'vf-grid-cell': true,
    'vf-grid-col-header': colHeader.value,
    'vf-grid-row-header': rowHeader.value,
  },
}))

useModifiers(({ align, valign }) => ({
  root: {
    'data-align': align.value || undefined,
    'data-valign': valign.value || undefined,
  },
}))

const { cell, cellCss, colspan, rowspan, nonce, uid } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div
      v-if="!template"
      :data-col-id="uid"
      :data-col="cell?.col"
      :data-row="cell?.row"
      :data-col-start="cell?.colStart"
      :data-col-end="cell?.colEnd"
      :data-row-start="cell?.rowStart"
      :data-row-end="cell?.rowEnd"
      :data-colspan="colspan"
      :data-rowspan="rowspan"
      v-bind="bindings.root"
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
