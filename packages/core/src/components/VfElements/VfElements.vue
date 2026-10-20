<script setup lang="ts">
import { defaults, blueprint } from '#src/blueprints/elements'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfElementsEmits, VfElementsProps, VfElementsSlots } from './types'

defineOptions({
  name: 'VfElements',

  inheritAttrs: false,
})
defineEmits<VfElementsEmits>()

const props = withDefaults(defineProps<VfElementsProps>(), defaults)
const events = defineEvents<VfElementsEmits>()
const slots = defineSlots<VfElementsSlots>()

const { context, expose, outlets, bindings, classes, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses({
  root: 'vf-elements',
})

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="bindings.root()">
      <slot>
        <component v-if="outlets?.default" :is="outlets.default" />
      </slot>
    </div>
  </slot>
</template>
