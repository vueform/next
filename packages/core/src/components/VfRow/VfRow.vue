<script setup lang="ts">
import { defaults, blueprint } from '#src/blueprints/row'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfRowEmits, VfRowProps, VfRowSlots } from './types'

defineOptions({ name: 'VfRow', inheritAttrs: false })
defineEmits<VfRowEmits>()

const props = withDefaults(defineProps<VfRowProps>(), defaults)
const events = defineEvents<VfRowEmits>()
const slots = defineSlots<VfRowSlots>()

const { api, context, expose, outlets, bindings, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: 'vf-grid-row',
})

const { uid } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div
      v-else
      :data-row-id="uid"
      :class="classes.root"
      v-bind="bindings.root()"
    >
      <slot>
        <component v-if="outlets?.default" :is="outlets.default" />
      </slot>
    </div>
  </slot>
</template>
