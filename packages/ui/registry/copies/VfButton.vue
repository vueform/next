<script setup lang="ts">
/**
 * Local copy of VfButton of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  layoutRegionBindings,
  showsHelp,
  useBlueprint,
  defineEvents,
  buildDescribedBy,
} from '@vueform/ui'
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

const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

const classes = useClasses({
  root: 'vf-button',
  button: () => [
    {
      'vf-btn': true,
      [api.tokenClass]: !!api.tokenCss.value,
    },
    props.layout === false ? props.class : undefined,
  ],
  icon: () => ({
    'vf-btn-icon': true,
    [api.icon.value!]: !!api.icon.value,
  }),
  text: 'vf-btn-text',
})

const bindings = useBindings(
  {
    button: () => {
      const isLink = !!(api.href.value || api.to.value)

      return {
        'data-variant': api.props.variant,
        'data-severity': api.severity.value,
        'data-size': api.props.size,
        'data-align': api.props.align || undefined,
        'data-fluid': api.props.fluid ? '' : undefined,
        'data-icon-only': !!api.icon.value && !api.text.value ? '' : undefined,
        'data-loading': api.loading.value ? '' : undefined,
        // Anchor mode has no native `disabled` attribute, so the styling
        // state needs its own marker there; `<button>` keeps `:disabled`.
        'data-disabled': isLink && api.disabled.value ? '' : undefined,
        disabled: !isLink ? api.disabled.value || undefined : undefined,
        'aria-disabled': isLink ? api.disabled.value || undefined : undefined,
        'aria-busy': api.loading.value || undefined,
        'aria-label':
          api.icon.value && !api.text.value ? api.genericName.value : undefined,
        'aria-describedby': buildDescribedBy([
          showsHelp(api) ? api.helpId.value : null,
          api.description.value ? api.descriptionId.value : null,
          api.displayErrors.value?.length ? api.errorId.value : null,
        ]),
      }
    },
    icon: () => ({
      'data-pos': api.props.iconPos,
    }),
  },
  layoutRegionBindings(api)
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
        v-bind="{ ...bindings.button(), ...attrs }"
        @click="handleClick"
      >
        <i
          v-if="icon"
          aria-hidden="true"
          :class="classes.icon"
          v-bind="bindings.icon()"
        />
        <slot name="before">
          <component v-if="outlets?.before" :is="outlets.before" />
        </slot>
        <slot :text :bindings="bindings.text()">
          <component
            v-if="outlets?.default"
            :is="outlets.default"
            :text
            :bindings="bindings.text()"
          />
          <span v-else-if="text" :class="classes.text" v-bind="bindings.text()">
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
