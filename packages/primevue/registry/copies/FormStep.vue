<script setup lang="ts">
import PrimeDivider from 'primevue/divider'
import PrimeStep from 'primevue/step'
import type {
  VfFormClasses,
  VfFormParts,
} from '@vueform/primevue/components/VfForm'
import { type ResolvedPage, vdomPrime } from '@vueform/primevue'

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
    parts: Partial<
      Pick<
        VfFormParts,
        | 'step'
        | 'stepInner'
        | 'stepHeader'
        | 'stepNumber'
        | 'stepIcon'
        | 'stepTitle'
      >
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
    v-bind="parts.step?.(page)"
    v-slot="{ a11yAttrs }"
    as-child
  >
    <div
      :class="classes.stepInner?.(page)"
      v-bind="{ ...a11yAttrs.root, ...parts.stepInner?.(page) }"
    >
      <button
        :class="classes.stepHeader?.(page)"
        v-bind="{
          ...a11yAttrs.header,
          onClick: undefined,
          disabled: !page.enabled,
          ...parts.stepHeader?.(page),
        }"
        @click="page.select"
      >
        <span
          :class="classes.stepNumber?.(page)"
          data-p
          data-pc-section="number"
          v-bind="parts.stepNumber?.(page)"
        >
          <i
            v-if="page.meta?.icon"
            :class="classes.stepIcon?.(page)"
            v-bind="parts.stepIcon?.(page)"
          />
          <template v-else>{{ page.index + 1 }}</template>
        </span>
        <span
          v-if="page.label"
          :class="classes.stepTitle?.(page)"
          v-bind="parts.stepTitle?.(page)"
        >
          {{ page.label }}
        </span>
      </button>
      <Divider v-if="divider" />
    </div>
  </Step>
</template>
