<script setup lang="ts">
import type { Pager, TProp } from '@vueform/core'

import type { NavPosProp } from '#primevue/blueprints/nav'

import type { VfFormClasses, VfFormParts } from './types'

defineOptions({ name: 'VfFormNav' })

defineProps<{
  pager: Pager
  nextLabel?: TProp
  backLabel?: TProp
  finishLabel?: TProp
  back: boolean
  classes: Pick<VfFormClasses, 'nav'>
  parts: Partial<Pick<VfFormParts, 'nav'>>
  /**
   * Prop-based slot components from the form blueprint.
   */
  slots?: Record<string, any>
  /**
   * Inline template slots from the parent VfForm (`useSlots()`). Keys are only
   * checked for presence — never invoked for inspection.
   */
  /**
   * @write
   */
  position?: NavPosProp
}>()
</script>

<template>
  <component
    v-if="slots?.nav"
    :is="slots?.nav"
    :pager
    :next-label
    :back-label
    :finish-label
    :show-back="back"
    :position
  />
  <VfNav
    v-else
    :pager
    :next="nextLabel"
    :back="backLabel"
    :finish="finishLabel"
    :hide-back="!back"
    :position
    :class="classes.nav"
    v-bind="parts.nav"
  >
    <template v-if="slots?.back" #back="slotProps">
      <component :is="slots?.back" v-bind="slotProps" />
    </template>
    <template v-if="slots?.backText" #backText="slotProps">
      <component :is="slots?.backText" v-bind="slotProps" />
    </template>
    <template v-if="slots?.next" #next="slotProps">
      <component :is="slots?.next" v-bind="slotProps" />
    </template>
    <template v-if="slots?.nextText" #nextText="slotProps">
      <component :is="slots?.nextText" v-bind="slotProps" />
    </template>
    <template v-if="slots?.finish" #finish="slotProps">
      <component :is="slots?.finish" v-bind="slotProps" />
    </template>
    <template v-if="slots?.finishText" #finishText="slotProps">
      <component :is="slots?.finishText" v-bind="slotProps" />
    </template>
  </VfNav>
</template>
