<script setup lang="ts">
import { defaults, blueprint } from '#core/blueprints/content'
import { useBlueprint } from '#core/composables'
import { defineEvents } from '#core/helpers'

import type { VfContentEmits, VfContentProps, VfContentSlots } from './types'

defineOptions({ name: 'VfContent', element: true, inheritAttrs: false })
defineEmits<VfContentEmits>()

const props = withDefaults(defineProps<VfContentProps>(), defaults)
const events = defineEvents<VfContentEmits>()
const slots = defineSlots<VfContentSlots>()

const { api, context, expose, outlets, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

useClasses(() => ({
  root: {
    'vf-content': true,
    'vf-left': props.align === 'left',
    'vf-center': props.align === 'center',
    'vf-right': props.align === 'right',
    'vf-justify': props.align === 'justify',
    'vf-aligned': !!props.aligned,
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
