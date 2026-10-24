<script setup lang="ts">
import { type ResolvedPage, vdomPrime } from '@vueform/primevue'
import type {
  VfFormBindingResolvers,
  VfFormClasses,
} from '@vueform/primevue/components/VfForm'
import PrimeDivider from 'primevue/divider'
import PrimeStep from 'primevue/step'

const Divider = vdomPrime(PrimeDivider)
const Step = vdomPrime(PrimeStep)
defineOptions({ name: 'VfFormStep' })

withDefaults(
  defineProps<{
    page: ResolvedPage
    classes: Pick<
      VfFormClasses,
      | 'step'
      | 'stepInner'
      | 'stepHeader'
      | 'stepNumber'
      | 'stepIcon'
      | 'stepTitle'
    >
    bindings: Pick<
      VfFormBindingResolvers,
      | 'step'
      | 'stepInner'
      | 'stepHeader'
      | 'stepNumber'
      | 'stepIcon'
      | 'stepTitle'
    >
    divider?: boolean
  }>(),
  {
    divider: false,
  }
)
</script>

<template>
  <Step
    :value="page.name"
    :class="classes.step?.(page)"
    v-bind="bindings.step(page)"
    v-slot="{ a11yAttrs }"
    as-child
  >
    <div
      :class="classes.stepInner?.(page)"
      v-bind="{ ...a11yAttrs.root, ...bindings.stepInner(page) }"
    >
      <button
        :class="classes.stepHeader?.(page)"
        v-bind="{
          ...a11yAttrs.header,
          onClick: undefined,
          disabled: !page.enabled,
          ...bindings.stepHeader(page),
        }"
        @click="page.select"
      >
        <span
          :class="classes.stepNumber?.(page)"
          data-p
          data-pc-section="number"
          v-bind="bindings.stepNumber(page)"
        >
          <i
            v-if="page.meta?.icon"
            :class="classes.stepIcon?.(page)"
            v-bind="bindings.stepIcon(page)"
          />
          <template v-else>{{ page.index + 1 }}</template>
        </span>
        <span
          v-if="page.label"
          :class="classes.stepTitle?.(page)"
          v-bind="bindings.stepTitle(page)"
        >
          {{ page.label }}
        </span>
      </button>
      <Divider v-if="divider" />
    </div>
  </Step>
</template>
