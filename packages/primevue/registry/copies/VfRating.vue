<script setup lang="ts">
/**
 * Local copy of VfRating of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfRatingEmits,
  type VfRatingProps,
  type VfRatingSlots,
} from '@vueform/primevue/components/VfRating'
import PrimeRating from 'primevue/rating'
import type { WritableComputedRef } from 'vue'

import '@vueform/primevue/rating.css'

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

const {
  api,
  context,
  expose,
  outlets,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-rating',
}))

useModifiers(({ hasError, help }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

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
        v-bind="{ ...forwardProps, ...bindings.input }"
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
