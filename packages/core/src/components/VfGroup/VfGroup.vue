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

const {
  api,
  context,
  expose,
  outlets,
  bindings,
  classes,
  useClasses,
  useBindings,
} = useBlueprint(blueprint, props, events, slots)

useClasses({
  root: 'vf-group',
  wrapper: () => [
    props.layout === false ? props.class : null,
    'vf-group-elements',
  ],
})

useBindings({
  root: () => ({
    'data-wrapped': api.props.wrap ? '' : undefined,
  }),
  wrapper: () => ({
    'data-stacked': api.props.stacked ? '' : undefined,
    'data-wrapped': api.props.innerWrap ? '' : undefined,
  }),
})

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
        :bindings="bindings.wrapper()"
      >
        <component
          v-if="outlets?.wrapper"
          :is="outlets.wrapper"
          :resolved-schema
          :label
          :bindings="bindings.wrapper()"
        />
        <div v-else :class="classes.wrapper" v-bind="bindings.wrapper()">
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
