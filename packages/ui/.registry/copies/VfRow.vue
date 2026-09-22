<script setup lang="ts">
/**
 * Local copy of VfRow of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { defaults, blueprint } from '@vueform/ui/blueprints/row'
import { useBlueprint, defineEvents } from '@vueform/ui'
import type {
  VfRowEmits,
  VfRowProps,
  VfRowSlots,
} from '@vueform/ui/components/VfRow'
import '@vueform/ui/grid.css'

defineOptions({ name: 'VfRow', inheritAttrs: false })
defineEmits<VfRowEmits>()

const props = withDefaults(defineProps<VfRowProps>(), defaults)
const events = defineEvents<VfRowEmits>()
const slots = defineSlots<VfRowSlots>()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-grid-row',
}))

const { uid } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" :data-row-id="uid" v-bind="parts.root">
      <slot>
        <component v-if="outlets?.default" :is="outlets.default" />
      </slot>
    </div>
  </slot>
</template>
