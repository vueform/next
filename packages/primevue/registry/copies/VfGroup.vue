<script setup lang="ts">
/**
 * Local copy of VfGroup of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents, schemaEntries } from '@vueform/primevue'
import {
  defaults,
  blueprint,
  type VfGroupEmits,
  type VfGroupProps,
  type VfGroupSlots,
} from '@vueform/primevue/components/VfGroup'

import '@vueform/primevue/group.css'

defineOptions({
  name: 'VfGroup',
  element: true,
  inheritAttrs: false,
  children: (props) => ({
    flat: props.nested !== true,
    entries: Object.fromEntries(schemaEntries(props.schema)),
  }),
})
defineEmits<VfGroupEmits>()

const props = withDefaults(defineProps<VfGroupProps>(), defaults)
const events = defineEvents<VfGroupEmits>()
const slots = defineSlots<VfGroupSlots>()

const { api, context, expose, outlets, bindings, useClasses, useModifiers } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props }) => ({
  root: 'vf-group',
  wrapper: [props.layout === false ? props.class : null, 'vf-group-elements'],
}))

useModifiers(({ props }) => ({
  root: {
    'data-wrapped': props.wrap ? '' : undefined,
  },
  wrapper: {
    'data-stacked': props.stacked ? '' : undefined,
    'data-wrapped': props.innerWrap ? '' : undefined,
  },
}))

const { resolvedSchema, label } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <slot name="wrapper" :resolved-schema :label :bindings="bindings.wrapper">
        <component
          v-if="outlets?.wrapper"
          :is="outlets.wrapper"
          :resolved-schema
          :label
          :bindings="bindings.wrapper"
        />
        <div v-else v-bind="bindings.wrapper">
          <slot :resolved-schema>
            <component
              v-if="outlets?.default"
              :is="outlets.default"
              :resolved-schema
            />
            <template v-else>
              <component
                v-for="el in resolvedSchema"
                :key="el.props.name"
                :is="el.component"
                v-bind="el.props"
              />
            </template>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
