<script setup lang="ts">
/**
 * Local copy of VfContent of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defaults, blueprint } from '@vueform/primevue/blueprints/content'
import { useBlueprint, defineEvents } from '@vueform/primevue'
import type {
  VfContentEmits,
  VfContentProps,
  VfContentSlots,
} from '@vueform/primevue/components/VfContent'
import '@vueform/primevue/content.css'

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
        <component v-else-if="isHtml" :is="tag" v-html="content" />
        <component v-else :is="() => content" />
      </slot>
    </VfLayout>
  </slot>
</template>
