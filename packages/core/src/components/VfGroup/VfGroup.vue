<script setup lang="ts">
import { defaults, blueprint } from '#src/blueprints/group'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'
import { schemaEntries } from '#src/utils'

import type { VfGroupEmits, VfGroupProps, VfGroupSlots } from './types'

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

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props }) => ({
  root: {
    'vf-group': true,
    'vf-wrapped': props.wrap,
  },
  wrapper: [
    props.layout === false ? props.class : null,
    {
      'vf-group-elements': true,
      'vf-stacked': props.stacked,
      'vf-wrapped': props.innerWrap,
    },
  ],
}))

const { resolvedSchema, label } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <slot
        name="wrapper"
        :resolved-schema
        :label
        :class="classes.wrapper"
        v-bind="parts.wrapper"
      >
        <component
          v-if="outlets?.wrapper"
          :is="outlets.wrapper"
          :resolved-schema
          :parts
          :classes
          :class="classes.wrapper"
          v-bind="parts.wrapper"
        />
        <div v-else :class="classes.wrapper" v-bind="parts.wrapper">
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
