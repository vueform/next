<script setup lang="ts">
/**
 * Local copy of VfAddon of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useAttrs } from 'vue'
import {
  type VfAddonEmits,
  type VfAddonProps,
  type VfAddonSlots,
  defaults,
  blueprint,
} from '@vueform/ui/components/VfAddon'
import { useBlueprint, defineEvents } from '@vueform/ui'
import '@vueform/ui/addon.css'

defineOptions({ name: 'VfAddon', inheritAttrs: false })
defineEmits<VfAddonEmits>()

const props = withDefaults(defineProps<VfAddonProps>(), defaults)
const events = defineEvents<VfAddonEmits>()
const slots = defineSlots<VfAddonSlots>()
const attrs = useAttrs()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-addon',
}))

const { resolved } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="{ ...parts.root, ...attrs }">
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
