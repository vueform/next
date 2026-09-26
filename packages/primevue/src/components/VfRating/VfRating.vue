<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeRating from 'primevue/rating'
import type { VfRatingEmits, VfRatingProps, VfRatingSlots } from './types'
import type { WritableComputedRef } from 'vue'
import { blueprint, defaults } from '#primevue/blueprints/rating'
import { vdomPrime } from '#primevue/helpers'

const Rating = vdomPrime(PrimeRating)

defineOptions({
  name: 'VfRating',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfRatingEmits>()

const props = withDefaults(defineProps<VfRatingProps>(), defaults)
const events = defineEvents<VfRatingEmits>()
const slots = defineSlots<VfRatingSlots>()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props }) => ({
  root: {
    'vf-rating': true,
    'vf-aligned': !!props.aligned,
  },
}))

const {
  value,
  name,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  input,
  forwardProps,
  forwardSlots,
  handleInput,
  handleBlur,
  handleFocus,
} = api

/**
 * PrimeVue Rating types `modelValue` as `number | undefined`. The element's
 * `value` is `TextishModel` (`string | number | null`), which is the same
 * runtime binding as before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<number | undefined>

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <Rating
        :name
        :class="classes.input"
        v-model="inputValue"
        :disabled
        :readonly
        :invalid
        v-bind="{
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="(e) => handleInput(e.value, e.originalEvent)"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </Rating>
    </VfLayout>
  </slot>
</template>
