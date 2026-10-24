<script setup lang="ts">
/**
 * Local copy of VfSteps of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, type ResolvedPage, defineEvents } from '@vueform/ui'
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

const { context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: 'vf-steps',
  list: 'vf-steps-wrapper',
  wrapper: 'vf-step-wrapper',
  step: 'vf-step',
})

const bindings = useBindings({
  wrapper: (page: ResolvedPage) => ({
    'data-selected': page.selected ? '' : undefined,
    'data-enabled': page.enabled ? '' : undefined,
    'data-completed': page.completed ? '' : undefined,
    'data-invalid': page.invalid ? '' : undefined,
    'data-loading': page.loading ? '' : undefined,
  }),
})

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="bindings.root()">
      <ol role="tablist" :class="classes.list" v-bind="bindings.list()">
        <template v-for="page in pager.pages" :key="page.pageId">
          <li
            v-if="page.available"
            role="none"
            :class="classes.wrapper"
            v-bind="bindings.wrapper(page)"
          >
            <button
              type="button"
              :id="page.pageId"
              role="tab"
              :aria-disabled="!page.enabled"
              :aria-selected="page.selected"
              :aria-controls="page.panelId"
              :tabindex="page.tabindex"
              :class="classes.step"
              v-bind="bindings.step()"
              @click="page.select"
              @keydown="page.keydown"
              @focus="page.focus"
              @blur="page.blur"
            >
              <slot v-bind="page" :bindings="bindings.step()">
                <component
                  v-if="outlets?.default"
                  :is="outlets.default"
                  v-bind="page"
                  :bindings="bindings.step()"
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
