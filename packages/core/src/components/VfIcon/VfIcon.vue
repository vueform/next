<script setup lang="ts">
import { useAttrs } from 'vue'
import { defaults, blueprint } from '@core/blueprints/icon'
import { useBlueprint } from '@core/composables'
import { defineEvents } from '@core/helpers'
import type { VfIconEmits, VfIconProps, VfIconSlots } from './types'

defineOptions({ name: 'VfIcon', inheritAttrs: false })
defineEmits<VfIconEmits>()

const props = withDefaults(defineProps<VfIconProps>(), defaults)
const events = defineEvents<VfIconEmits>()
const slots = defineSlots<VfIconSlots>()
const attrs = useAttrs()

const { parts, classes, context, expose, outlets, useClasses, propRefs } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-icon',
}))

const { icon } = propRefs

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <i
      v-else-if="icon"
      :class="[classes.root, icon]"
      v-bind="{ ...parts.root, ...attrs }"
    />
  </slot>
</template>
