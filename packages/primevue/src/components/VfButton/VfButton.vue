<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeButton from 'primevue/button'
import { useAttrs } from 'vue'
import { blueprint, defaults } from '@/blueprints/button'
import { vdomPrime } from '@/helpers'
import type { VfButtonEmits, VfButtonProps, VfButtonSlots } from './types'

defineOptions({ name: 'VfButton', element: true, inheritAttrs: false })
defineEmits<VfButtonEmits>()

const props = withDefaults(defineProps<VfButtonProps>(), defaults)
const events = defineEvents<VfButtonEmits>()
const slots = defineSlots<VfButtonSlots>()
const attrs = useAttrs()

// Non-colliding tag: Vapor treats `<Button>` as native `<button>`.
const PvButton = vdomPrime(PrimeButton)

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ help }) => ({
  root: {
    'vf-button': true,
    'vf-align-label': !help.value,
  },
  button: [
    props.layout === false ? props.class : null,
    {
      [api.tokenClass]: !!api.tokenCss.value,
      'vf-left': props.align === 'left',
      'vf-right': props.align === 'right',
      'vf-center': props.align === 'center',
    },
  ],
}))

const { target, rel, download, fluid } = propRefs

const {
  viewLoaded,
  text,
  icon,
  severity,
  badge,
  badgeSeverity,
  loading,
  disabled,
  tokenCss,
  href,
  as,
  tooltipModifiers,
  tooltipValue,
  forwardSlots,
  nonce,
  handleClick,
} = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :addons="false" :loading="false">
      <PvButton
        :label="text"
        :icon
        :loading
        :fluid
        :disabled
        :href
        :target
        :rel
        :as
        :download
        :severity
        :badge
        :badge-severity="badgeSeverity"
        :class="classes.button"
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{
          ...parts.button,
          ...attrs,
        }"
        @click="handleClick"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </PvButton>
      <component v-if="tokenCss" :is="'style'" :nonce.attr="nonce">
        {{ tokenCss }}
      </component>
    </VfLayout>
  </slot>
</template>
