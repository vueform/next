<script setup lang="ts">
/**
 * Local copy of VfRow of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/primevue'
import {
  defaults,
  blueprint,
  type VfRowEmits,
  type VfRowProps,
  type VfRowSlots,
} from '@vueform/primevue/components/VfRow'

import '@vueform/primevue/grid.css'

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
