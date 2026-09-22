<script setup lang="ts">
/**
 * Local copy of VfIcon of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useAttrs } from 'vue'
import { defaults, blueprint } from '@vueform/ui/blueprints/icon'
import { useBlueprint, defineEvents } from '@vueform/ui'
import type {
  VfIconEmits,
  VfIconProps,
  VfIconSlots,
} from '@vueform/ui/components/VfIcon'
import '@vueform/ui/icon.css'
import '@vueform/ui/animation.css'

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
