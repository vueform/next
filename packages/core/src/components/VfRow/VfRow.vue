<script setup lang="ts">
import { defaults, blueprint } from '@core/blueprints/row'
import { useBlueprint } from '@core/composables'
import { defineEvents } from '@core/helpers'
import type { VfRowEmits, VfRowProps, VfRowSlots } from './types'

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
