<script setup lang="ts">
/**
 * Local copy of VfAddon of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import PrimeInputGroupAddon from 'primevue/inputgroupaddon'
import { useAttrs } from 'vue'
import { blueprint, defaults } from '@vueform/primevue/blueprints/addon'
import type {
  VfAddonEmits,
  VfAddonProps,
  VfAddonSlots,
} from '@vueform/primevue/components/VfAddon'
import '@vueform/primevue/addon.css'

const InputGroupAddon = vdomPrime(PrimeInputGroupAddon)

defineOptions({ name: 'VfAddon', inheritAttrs: false })
defineEmits<VfAddonEmits>()

const props = withDefaults(defineProps<VfAddonProps>(), defaults)
const events = defineEvents<VfAddonEmits>()
const slots = defineSlots<VfAddonSlots>()
const attrs = useAttrs()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({}))

const { resolved } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <InputGroupAddon
      v-else
      :class="classes.root"
      v-bind="{ ...parts.root, ...attrs }"
    >
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
