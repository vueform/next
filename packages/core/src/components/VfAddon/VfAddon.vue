<script setup lang="ts">
import { useAttrs } from 'vue'

import { defaults, blueprint } from '#src/blueprints/addon'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfAddonEmits, VfAddonProps, VfAddonSlots } from './types'

defineOptions({ name: 'VfAddon', inheritAttrs: false })
defineEmits<VfAddonEmits>()

const props = withDefaults(defineProps<VfAddonProps>(), defaults)
const events = defineEvents<VfAddonEmits>()
const slots = defineSlots<VfAddonSlots>()
const attrs = useAttrs()

const { api, context, expose, outlets, bindings, classes, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses({
  root: 'vf-addon',
})

const { resolved } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="{ ...bindings.root, ...attrs }">
      <component
        v-if="resolved && typeof resolved === 'object'"
        :is="resolved.component"
        v-bind="resolved.props"
        :layout="false"
        hoist
      />
      <span v-else-if="resolved">
        {{ resolved }}
      </span>
      <slot v-else>
        <component v-if="outlets?.default" :is="outlets.default" />
      </slot>
    </div>
  </slot>
</template>
