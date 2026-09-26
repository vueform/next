<script setup lang="ts">
/**
 * Local copy of VfNav of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  type VfNavEmits,
  type VfNavProps,
  type VfNavSlots,
  defaults,
  blueprint,
} from '@vueform/ui/components/VfNav'
import {
  useBlueprint,
  useLocale,
  useFormContext,
  defineEvents,
} from '@vueform/ui'
import '@vueform/ui/nav.css'

defineOptions({ name: 'VfNav', inheritAttrs: false })
defineEmits<VfNavEmits>()

const props = withDefaults(defineProps<VfNavProps>(), defaults)
const events = defineEvents<VfNavEmits>()
const slots = defineSlots<VfNavSlots>()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: {
    'vf-nav': true,
    'vf-no-back': !props.pager.previousPage && !!props.hideBack,
    'vf-left': props.position === 'left',
    'vf-center': props.position === 'center',
    'vf-right': props.position === 'right',
    'vf-fluid': props.position === 'fluid',
  },
  back: {
    'vf-nav-back': true,
  },
  next: {
    'vf-nav-next': true,
    'vf-loading': api.loading.value,
  },
  finish: {
    'vf-nav-finish': true,
    'vf-loading': api.loading.value,
  },
}))

const form$ = useFormContext()
const { t } = useLocale()
const { hideBack } = propRefs
const {
  backLabel,
  loading,
  backAriaBindings,
  forwardAriaBindings,
  nextLabel,
  finishLabel,
  statusId,
  fluid,
} = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="parts.root">
      <template v-if="pager.previousPage || !hideBack">
        <slot
          name="back"
          :label="backLabel"
          :form$
          :pager
          :disabled="!pager.previousPage"
          :fluid
          :back="pager.back"
          :a11y-bindings="backAriaBindings"
          :class="classes.back"
          v-bind="parts.back"
        >
          <component
            v-if="outlets?.back"
            :is="outlets.back"
            :label="backLabel"
            :form$
            :pager
            :disabled="!pager.previousPage"
            :fluid
            :back="pager.back"
            :a11y-bindings="backAriaBindings"
            :class="classes.back"
            v-bind="parts.back"
          />
          <VfButton
            v-else
            :layout="false"
            detached
            hide-label
            :submit="false"
            name="back"
            :fluid
            :disabled="!pager.previousPage"
            :class="classes.back"
            v-bind="{ ...backAriaBindings, ...parts.back }"
            @click="pager.back"
          >
            <slot name="backText" :label="backLabel" :pager :form$>
              <component
                v-if="outlets?.backText"
                :is="outlets.backText"
                :label="backLabel"
                :pager
                :form$
              />
              <template v-else>
                {{ backLabel }}
              </template>
            </slot>
          </VfButton>
        </slot>
      </template>

      <template v-if="pager.nextPage">
        <slot
          name="next"
          :label="nextLabel"
          :form$
          :pager
          :loading
          :fluid
          :a11y-bindings="forwardAriaBindings"
          :disabled="loading"
          :next="pager.next"
          :class="classes.next"
          v-bind="parts.next"
        >
          <component
            v-if="outlets?.next"
            :is="outlets.next"
            :label="nextLabel"
            :form$
            :pager
            :loading
            :fluid
            :disabled="loading"
            :a11y-bindings="forwardAriaBindings"
            :next="pager.next"
            :class="classes.next"
            v-bind="parts.next"
          />
          <VfButton
            v-else
            :layout="false"
            detached
            hide-label
            :submit="false"
            name="next"
            severity="primary"
            :fluid
            :disabled="loading"
            :class="classes.next"
            v-bind="{ ...forwardAriaBindings, ...parts.next }"
            @click="pager.next"
          >
            <slot name="nextText" :label="nextLabel" :pager :form$>
              <component
                v-if="outlets?.nextText"
                :is="outlets.nextText"
                :label="nextLabel"
                :pager
                :form$
              />
              <template v-else>
                {{ nextLabel }}
              </template>
            </slot>
          </VfButton>
        </slot>
      </template>

      <template v-if="!pager.nextPage">
        <slot
          name="finish"
          :label="finishLabel"
          :form$
          :pager
          :loading
          :a11y-bindings="forwardAriaBindings"
          :disabled="loading"
          :fluid
          :finish="pager.finish"
          :class="classes.finish"
          v-bind="parts.finish"
        >
          <component
            v-if="outlets?.finish"
            :is="outlets.finish"
            :label="finishLabel"
            :form$
            :pager
            :loading
            :fluid
            :disabled="loading"
            :a11y-bindings="forwardAriaBindings"
            :finish="pager.finish"
            :class="classes.finish"
            v-bind="parts.finish"
          />
          <VfButton
            v-else
            :layout="false"
            detached
            hide-label
            :submit="false"
            name="finish"
            severity="primary"
            :fluid
            :disabled="loading"
            :class="classes.finish"
            v-bind="{ ...forwardAriaBindings, ...parts.finish }"
            @click="pager.finish"
          >
            <slot name="finishText" :label="finishLabel" :pager :form$>
              <component
                v-if="outlets?.finishText"
                :is="outlets.finishText"
                :label="finishLabel"
                :pager
                :form$
              />
              <template v-else>
                {{ finishLabel }}
              </template>
            </slot>
          </VfButton>
        </slot>
      </template>

      <span
        v-if="pager.invalid || pager.loading"
        class="sr-only"
        role="status"
        :id="statusId"
        v-bind="parts.srOnlyLoading"
      >
        <template v-if="pager.loading">
          {{ t('sr_step_error') }}
        </template>
        <template v-else-if="pager.invalid">
          {{ t('sr_step_error') }}
        </template>
      </span>
    </div>
  </slot>
</template>
