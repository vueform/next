<script setup lang="ts">
/**
 * Local copy of VfAddon of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfAddonEmits,
  type VfAddonProps,
  type VfAddonSlots,
} from '@vueform/primevue/components/VfAddon'
import PrimeInputGroupAddon from 'primevue/inputgroupaddon'
import { useAttrs } from 'vue'

import '@vueform/primevue/addon.css'

const InputGroupAddon = vdomPrime(PrimeInputGroupAddon)

defineOptions({ name: 'VfAddon', inheritAttrs: false })
defineEmits<VfAddonEmits>()

const props = withDefaults(defineProps<VfAddonProps>(), defaults)
const events = defineEvents<VfAddonEmits>()
const slots = defineSlots<VfAddonSlots>()
const attrs = useAttrs()

const { api, context, expose, outlets, bindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const { resolved } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <InputGroupAddon v-else v-bind="{ ...bindings.root(), ...attrs }">
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
    </InputGroupAddon>
  </slot>
</template>
