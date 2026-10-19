<script setup lang="ts">
/**
 * Local copy of VfAddon of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfAddonEmits,
  type VfAddonProps,
  type VfAddonSlots,
} from '@vueform/ui/components/VfAddon'
import { useAttrs } from 'vue'

import '@vueform/ui/addon.css'

defineOptions({ name: 'VfAddon', inheritAttrs: false })
defineEmits<VfAddonEmits>()

const props = withDefaults(defineProps<VfAddonProps>(), defaults)
const events = defineEvents<VfAddonEmits>()
const slots = defineSlots<VfAddonSlots>()
const attrs = useAttrs()

const { api, context, expose, outlets, bindings, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

useClasses(() => ({
  root: 'vf-addon',
}))

const { resolved } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else v-bind="{ ...bindings.root, ...attrs }">
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
