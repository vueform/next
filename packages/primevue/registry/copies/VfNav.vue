<script setup lang="ts">
/**
 * Local copy of VfNav of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  useLocale,
  useFormContext,
  defineEvents,
} from '@vueform/primevue'
import {
  defaults,
  blueprint,
  type VfNavEmits,
  type VfNavProps,
  type VfNavSlots,
} from '@vueform/primevue/components/VfNav'

import '@vueform/primevue/nav.css'
import '@vueform/primevue/steps.css'

defineOptions({ name: 'VfNav', inheritAttrs: false })
defineEmits<VfNavEmits>()

const props = withDefaults(defineProps<VfNavProps>(), defaults)
const events = defineEvents<VfNavEmits>()
const slots = defineSlots<VfNavSlots>()

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-nav',
  back: 'vf-nav-back',
  next: 'vf-nav-next',
  finish: 'vf-nav-finish',
}))

useModifiers(({ props, loading }) => ({
  root: {
    'data-position': props.position || undefined,
    'data-no-back':
      !props.pager.previousPage && !!props.hideBack ? '' : undefined,
  },
  next: {
    'data-loading': loading.value ? '' : undefined,
  },
  finish: {
    'data-loading': loading.value ? '' : undefined,
  },
}))

useA11y(({ props, loading, describedby, statusId }) => {
  const forward = {
    'aria-busy': loading.value || undefined,
    'aria-disabled': loading.value || undefined,
    'aria-describedby': describedby.value,
  }

  return {
    back: {
      'aria-disabled': !props.pager.previousPage || undefined,
    },
    next: forward,
    finish: forward,
    srOnlyLoading: {
      id: statusId.value,
      role: 'status',
    },
  }
})

const form$ = useFormContext()
const { t } = useLocale()
const { hideBack } = propRefs
const { backLabel, loading, nextLabel, finishLabel, fluid } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else v-bind="bindings.root">
      <template v-if="pager.previousPage || !hideBack">
        <slot
          name="back"
          :label="backLabel"
          :form$
          :pager
          :disabled="!pager.previousPage"
          :fluid
          :bindings="bindings.back"
          :back="pager.back"
        >
          <component
            v-if="outlets?.back"
            :is="outlets.back"
            :label="backLabel"
            :form$
            :pager
            :disabled="!pager.previousPage"
            :fluid
            :bindings="bindings.back"
            :back="pager.back"
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
            v-bind="bindings.back"
            @click="pager.back"
          >
            <slot name="back-text" :label="backLabel" :pager :form$>
              <component
                v-if="outlets?.['back-text']"
                :is="outlets['back-text']"
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
          :disabled="loading"
          :bindings="bindings.next"
          :next="pager.next"
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
            :bindings="bindings.next"
            :next="pager.next"
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
            v-bind="bindings.next"
            @click="pager.next"
          >
            <slot name="next-text" :label="nextLabel" :pager :form$>
              <component
                v-if="outlets?.['next-text']"
                :is="outlets['next-text']"
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
          :disabled="loading"
          :fluid
          :bindings="bindings.finish"
          :finish="pager.finish"
        >
          <component
            v-if="outlets?.finish"
            :is="outlets.finish"
            :label="finishLabel"
            :form$
            :pager
            :loading
            :disabled="loading"
            :fluid
            :bindings="bindings.finish"
            :finish="pager.finish"
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
            v-bind="bindings.finish"
            @click="pager.finish"
          >
            <slot name="finish-text" :label="finishLabel" :pager :form$>
              <component
                v-if="outlets?.['finish-text']"
                :is="outlets['finish-text']"
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
        v-bind="bindings.srOnlyLoading"
      >
        <template v-if="pager.loading">
          {{ t('sr_step_loading') }}
        </template>
        <template v-else-if="pager.invalid">
          {{ t('sr_step_error') }}
        </template>
      </span>
    </div>
  </slot>
</template>
