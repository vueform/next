<script setup lang="ts">
/**
 * Local copy of VfButton of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfButtonEmits,
  type VfButtonProps,
  type VfButtonSlots,
} from '@vueform/primevue/components/VfButton'
import PrimeButton from 'primevue/button'
import { useAttrs } from 'vue'

import '@vueform/primevue/button.css'

defineOptions({ name: 'VfButton', element: true, inheritAttrs: false })
defineEmits<VfButtonEmits>()

const props = withDefaults(defineProps<VfButtonProps>(), defaults)
const events = defineEvents<VfButtonEmits>()
const slots = defineSlots<VfButtonSlots>()
const attrs = useAttrs()

// Non-colliding tag: Vapor treats `<Button>` as native `<button>`.
const PvButton = vdomPrime(PrimeButton)

const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

useClasses({
  root: 'vf-button',
  button: () => [
    props.layout === false ? props.class : null,
    {
      [api.tokenClass]: !!api.tokenCss.value,
    },
  ],
})

const bindings = useBindings({
  button: () => ({
    'data-severity': api.severity.value,
    'data-align': api.props.align || undefined,
    'data-fluid': api.props.fluid ? '' : undefined,
    'data-loading': api.loading.value ? '' : undefined,
    'data-icon-only': !!api.icon.value && !api.text.value ? '' : undefined,
    // Anchor mode has no native `disabled` attribute, so the styling state
    // needs its own marker there; `<button>` keeps `:disabled`.
    'data-disabled': api.href.value && api.disabled.value ? '' : undefined,
  }),
})

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
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{ ...bindings.button(), ...attrs }"
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
