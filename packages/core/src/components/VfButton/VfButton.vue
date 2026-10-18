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

const {
  api,
  parts,
  classes,
  context,
  expose,
  outlets,
  propRefs,
  a11yBindings,
  modifiers,
  useClasses,
  useModifiers,
} = useBlueprint(blueprint, props, events, slots)

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

useModifiers(
  ({ props, severity, icon, text, href, to, loading, disabled }) => ({
    button: {
      'data-variant': props.variant,
      'data-severity': severity.value,
      'data-size': props.size,
      'data-align': props.align || undefined,
      'data-fluid': props.fluid ? '' : undefined,
      'data-icon-only': !!icon.value && !text.value ? '' : undefined,
      'data-loading': loading.value ? '' : undefined,
      // Anchor mode has no native `disabled` attribute, so the styling state
      // needs its own marker there; `<button>` keeps `:disabled`.
      'data-disabled':
        (href.value || to.value) && disabled.value ? '' : undefined,
    },
    icon: {
      'data-pos': props.iconPos,
    },
  })
)

const { viewLoaded, text, href, to, id, tokenCss, icon, nonce, handleClick } =
  api

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
        :class="classes.button"
        v-bind="{
          ...modifiers.button,
          ...a11yBindings.button,
          ...parts.button,
          ...attrs,
        }"
        @click="handleClick"
      >
        <i
          v-if="icon"
          :class="classes.icon"
          aria-hidden="true"
          v-bind="{ ...modifiers.icon, ...parts.icon }"
        />
        <slot name="before">
          <component v-if="outlets?.before" :is="outlets.before" />
        </slot>
        <slot :text :classes :parts>
          <component
            v-if="outlets?.default"
            :is="outlets.default"
            :text
            :classes
            :parts
          />
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
