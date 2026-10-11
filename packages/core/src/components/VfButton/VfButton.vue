<script setup lang="ts">
import { useAttrs } from 'vue'

import { defaults, blueprint } from '#src/blueprints/button'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfButtonEmits, VfButtonProps, VfButtonSlots } from './types'

defineOptions({ name: 'VfButton', element: true, inheritAttrs: false })
defineEmits<VfButtonEmits>()

const props = withDefaults(defineProps<VfButtonProps>(), defaults)
const events = defineEvents<VfButtonEmits>()
const slots = defineSlots<VfButtonSlots>()
const attrs = useAttrs()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: {
    'vf-button': true,
    'vf-align-label': !api.help.value,
  },
  button: [
    {
      'vf-btn': true,
      [api.tokenClass]: !!api.tokenCss.value,
      'vf-filled': props.variant === 'filled',
      'vf-outlined': props.variant === 'outlined',
      'vf-text': props.variant === 'text',
      'vf-link': props.variant === 'link',
      'vf-primary': api.severity.value === 'primary',
      'vf-secondary': api.severity.value === 'secondary',
      'vf-success': api.severity.value === 'success',
      'vf-info': api.severity.value === 'info',
      'vf-warn': api.severity.value === 'warn',
      'vf-help': api.severity.value === 'help',
      'vf-danger': api.severity.value === 'danger',
      'vf-contrast': api.severity.value === 'contrast',
      'vf-sm': props.size === 'small',
      'vf-fluid': props.fluid,
      'vf-disabled': api.disabled.value,
      'vf-loading': api.loading.value,
      'vf-left': props.align === 'left',
      'vf-right': props.align === 'right',
      'vf-center': props.align === 'center',
      'vf-icon-only': !!api.icon.value && !api.text.value,
    },
    props.layout === false ? props.class : undefined,
  ],
  icon: {
    'vf-btn-icon': true,
    [api.icon.value!]: !!api.icon.value,
    'vf-right': props.iconPos === 'right',
    'vf-top': props.iconPos === 'top',
    'vf-bottom': props.iconPos === 'bottom',
  },
  text: 'vf-btn-text',
}))

const {
  viewLoaded,
  text,
  href,
  to,
  disabled,
  tokenCss,
  icon,
  nonce,
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
        :href="href || to"
        :target
        :rel
        :download
        :disabled
        :class="classes.button"
        v-bind="{ ...parts.button, ...attrs }"
        @click="handleClick"
      >
        <i v-if="icon" :class="classes.icon" v-bind="parts.icon" />
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
