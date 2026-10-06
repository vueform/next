<script setup lang="ts">
/**
 * Local copy of VfHidden of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/primevue'
import {
  defaults,
  blueprint,
  type VfHiddenEmits,
  type VfHiddenProps,
  type VfHiddenSlots,
} from '@vueform/primevue/components/VfHidden'

defineOptions({ name: 'VfHidden', element: true, inheritAttrs: false })
defineEmits<VfHiddenEmits>()

const props = withDefaults(defineProps<VfHiddenProps>(), defaults)
const events = defineEvents<VfHiddenEmits>()
const slots = defineSlots<VfHiddenSlots>()

const { api, context, expose, outlets, propRefs } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const { meta } = propRefs
const { viewLoaded, name, id, visible, inputValue } = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <input
      v-else-if="!meta"
      v-show="visible"
      type="hidden"
      :name
      :id
      :value="inputValue"
    />
  </slot>
</template>
