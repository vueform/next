<script setup lang="ts">
/**
 * Local copy of VfSteps of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfStepsEmits,
  type VfStepsProps,
  type VfStepsSlots,
} from '@vueform/ui/components/VfSteps'

import '@vueform/ui/steps.css'
import '@vueform/ui/animation.css'

defineOptions({ name: 'VfSteps', inheritAttrs: false })
defineEmits<VfStepsEmits>()

const props = withDefaults(defineProps<VfStepsProps>(), defaults)
const events = defineEvents<VfStepsEmits>()
const slots = defineSlots<VfStepsSlots>()

const { parts, classes, context, expose, outlets, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

useClasses(() => ({
  root: 'vf-steps',
  list: 'vf-steps-wrapper',
  wrapper: 'vf-step-wrapper',
  step: 'vf-step',
}))

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root">
      <ol :class="classes.list" role="tablist" v-bind="parts.list">
        <template v-for="page in pager.pages" :key="page.pageId">
          <li
            v-if="page.available"
            :class="classes.wrapper"
            :data-selected="page.selected ? '' : undefined"
            :data-enabled="page.enabled ? '' : undefined"
            :data-completed="page.completed ? '' : undefined"
            :data-invalid="page.invalid ? '' : undefined"
            :data-loading="page.loading ? '' : undefined"
            role="none"
            v-bind="parts.wrapper?.(page)"
          >
            <button
              type="button"
              :class="classes.step"
              :id="page.pageId"
              role="tab"
              :aria-disabled="!page.enabled"
              :aria-selected="page.selected"
              :aria-controls="page.panelId"
              :tabindex="page.tabindex"
              v-bind="parts.step"
              @click="page.select"
              @keydown="page.keydown"
              @focus="page.focus"
              @blur="page.blur"
            >
              <slot v-bind="page">
                <component
                  v-if="outlets?.default"
                  :is="outlets.default"
                  v-bind="page"
                />
                <template v-else>
                  {{ page.label }}
                </template>
              </slot>
            </button>
          </li>
        </template>
      </ol>
    </div>
  </slot>
</template>
