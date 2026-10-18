<script setup lang="ts">
/**
 * Local copy of VfButton of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfButtonEmits,
  type VfButtonProps,
  type VfButtonSlots,
} from '@vueform/ui/components/VfButton'
import { useAttrs } from 'vue'

import '@vueform/ui/button.css'
import '@vueform/ui/animation.css'

defineOptions({ name: 'VfButton', element: true, inheritAttrs: false })
defineEmits<VfButtonEmits>()

const props = withDefaults(defineProps<VfButtonProps>(), defaults)
const events = defineEvents<VfButtonEmits>()
const slots = defineSlots<VfButtonSlots>()
const attrs = useAttrs()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-button',
  button: [
    {
      'vf-btn': true,
      [api.tokenClass]: !!api.tokenCss.value,
    },
    props.layout === false ? props.class : undefined,
  ],
  icon: {
    'vf-btn-icon': true,
    [api.icon.value!]: !!api.icon.value,
  },
  text: 'vf-btn-text',
}))

const {
  viewLoaded,
  text,
  href,
  to,
  id,
  severity,
  tokenCss,
  icon,
  nonce,
  a11yBindings,
  handleClick,
} = api

const { target, rel, download } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :addons="false">
      <component
        :is="href || to ? 'a' : 'button'"
        :type="href || to ? undefined : 'button'"
        :id
        :href="href || to"
        :target
        :rel
        :download
        :data-variant="props.variant"
        :data-severity="severity"
        :data-size="props.size"
        :data-align="props.align || undefined"
        :data-fluid="props.fluid ? '' : undefined"
        :data-icon-only="!!icon && !text ? '' : undefined"
        :class="classes.button"
        v-bind="{ ...a11yBindings.button, ...parts.button, ...attrs }"
        @click="handleClick"
      >
        <i
          v-if="icon"
          :class="classes.icon"
          :data-pos="props.iconPos"
          aria-hidden="true"
          v-bind="parts.icon"
        />
        <slot name="before">
          <component v-if="outlets?.before" :is="outlets.before" />
        </slot>
        <slot :text>
          <component v-if="outlets?.default" :is="outlets.default" :text />
          <span v-else-if="text" :class="classes.text" v-bind="parts.text">
            {{ text }}
          </span>
        </slot>
        <slot name="after">
          <component v-if="outlets?.after" :is="outlets.after" />
        </slot>
      </component>
      <component v-if="tokenCss" :is="'style'" :nonce.attr="nonce">
        {{ tokenCss }}
      </component>
    </VfLayout>
  </slot>
</template>
