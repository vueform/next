<script setup lang="ts">
import { useAttrs } from 'vue'

import { defaults, blueprint } from '#src/blueprints/icon'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfIconEmits, VfIconProps, VfIconSlots } from './types'

defineOptions({ name: 'VfIcon', inheritAttrs: false })
defineEmits<VfIconEmits>()

const props = withDefaults(defineProps<VfIconProps>(), defaults)
const events = defineEvents<VfIconEmits>()
const slots = defineSlots<VfIconSlots>()
const attrs = useAttrs()

const { context, expose, outlets, bindings, useClasses, propRefs } =
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
      :class="icon"
      aria-hidden="true"
      v-bind="{ ...bindings.root, ...attrs }"
    />
  </slot>
</template>
