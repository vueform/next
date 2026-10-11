<script setup lang="ts">
/**
 * Local copy of VfElements of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/primevue'
import {
  defaults,
  blueprint,
  type VfElementsEmits,
  type VfElementsProps,
  type VfElementsSlots,
} from '@vueform/primevue/components/VfElements'

import '@vueform/primevue/form.css'

defineOptions({
  name: 'VfElements',

  inheritAttrs: false,
})
defineEmits<VfElementsEmits>()

const props = withDefaults(defineProps<VfElementsProps>(), defaults)
const events = defineEvents<VfElementsEmits>()
const slots = defineSlots<VfElementsSlots>()

const { parts, classes, context, expose, outlets, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

useClasses(() => ({
  root: 'vf-elements',
}))

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="parts.root">
      <slot>
        <component v-if="outlets?.default" :is="outlets.default" />
      </slot>
    </div>
  </slot>
</template>
