<script setup lang="ts">
import type { VfElementsEmits, VfElementsProps, VfElementsSlots } from './types'
import { defaults, blueprint } from '#core/blueprints/elements'
import { useBlueprint } from '#core/composables'
import { defineEvents } from '#core/helpers'

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
