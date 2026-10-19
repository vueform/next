<script setup lang="ts">
import { defaults, blueprint } from '#src/blueprints/content'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfContentEmits, VfContentProps, VfContentSlots } from './types'

defineOptions({ name: 'VfContent', element: true, inheritAttrs: false })
defineEmits<VfContentEmits>()

const props = withDefaults(defineProps<VfContentProps>(), defaults)
const events = defineEvents<VfContentEmits>()
const slots = defineSlots<VfContentSlots>()

const { api, context, expose, outlets, useClasses, useModifiers } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-content',
}))

useModifiers(({ props, help }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
    'data-align': props.align || undefined,
    'data-aligned': props.aligned ? '' : undefined,
  },
}))

const { viewLoaded, content, isHtml, tag } = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :label="false">
      <slot :context>
        <component v-if="outlets?.default" :is="outlets.default" :context />
        <!-- `tag` is always a native HTML tag, and rendering user-provided
          HTML is this component's purpose. -->
        <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
        <component v-else-if="isHtml" :is="tag" v-html="content" />
        <component v-else :is="() => content" />
      </slot>
    </VfLayout>
  </slot>
</template>
