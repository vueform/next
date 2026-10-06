<script setup lang="ts">
import { defaults, blueprint } from '#core/blueprints/steps'
import { useBlueprint } from '#core/composables'
import { defineEvents } from '#core/helpers'

import type { VfStepsEmits, VfStepsProps, VfStepsSlots } from './types'

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
  wrapper: ({
    selected,
    enabled,
    completed,
    invalid,
    loading,
  }: {
    selected: boolean
    enabled: boolean
    completed: boolean
    invalid: boolean
    loading: boolean
  }) => [
    'vf-step-wrapper',
    {
      'vf-selected': selected,
      'vf-enabled': enabled,
      'vf-completed': completed,
      'vf-invalid': invalid,
      'vf-loading': loading,
    },
  ],
  step: 'vf-step',
}))

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root">
      <ol :class="classes.list" role="tablist" v-bind="parts.list">
        <template v-for="page in pager.pages">
          <li
            v-if="page.available"
            :class="classes.wrapper(page)"
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
              :aria-current="page.selected"
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
