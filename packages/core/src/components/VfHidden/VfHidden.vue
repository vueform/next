<script setup lang="ts">
import type { VfHiddenEmits, VfHiddenProps, VfHiddenSlots } from './types'
import { defaults, blueprint } from '#core/blueprints/hidden'
import { useBlueprint } from '#core/composables'
import { defineEvents } from '#core/helpers'

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
