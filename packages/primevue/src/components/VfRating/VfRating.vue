<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeRating from 'primevue/rating'
import type { WritableComputedRef } from 'vue'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/rating'
import { vdomPrime } from '#src/helpers'

import type { VfRatingEmits, VfRatingProps, VfRatingSlots } from './types'

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

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: 'vf-rating',
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  inputAria(api)
)

const {
  value,
  name,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  inputRef,
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
        v-model="inputValue"
        :disabled
        :readonly
        :invalid
        :class="classes.input"
        v-bind="{ ...forwardProps, ...bindings.input() }"
        :ref="(el) => (inputRef = el)"
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
