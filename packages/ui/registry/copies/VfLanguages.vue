<script setup lang="ts">
/**
 * Local copy of VfLanguages of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfLanguagesEmits,
  type VfLanguagesProps,
  type VfLanguagesSlots,
} from '@vueform/ui/components/VfLanguages'

import '@vueform/ui/languages.css'

defineOptions({
  name: 'VfLanguages',
})
defineEmits<VfLanguagesEmits>()

const props = withDefaults(defineProps<VfLanguagesProps>(), defaults)
const events = defineEvents<VfLanguagesEmits>()
const slots = defineSlots<VfLanguagesSlots>()

const { api, parts, classes, context, expose, outlets, useClasses, propRefs } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-languages',
  list: 'vf-languages-wrapper',
  wrapper: 'vf-language-wrapper',
  language: 'vf-language',
}))

const { languages, language, invalidLanguages } = propRefs
const { handleSelect } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="parts.root">
      <!-- Plain buttons on purpose: tablist roles are a keyboard contract
        (roving tabindex, arrow keys) this component does not implement yet.
        aria-current marks the active language without promising tab
        semantics. -->
      <ul :class="classes.list" v-bind="parts.list">
        <li
          v-for="(label, value) in languages"
          :key="value"
          :class="classes.wrapper"
          :data-selected="language === value ? '' : undefined"
          :data-invalid="
            invalidLanguages?.has(value as string) ? '' : undefined
          "
          v-bind="
            parts.wrapper?.(
              language === value,
              !!invalidLanguages?.has(value as string)
            )
          "
        >
          <button
            type="button"
            :class="classes.language"
            :aria-current="language === value || undefined"
            :aria-invalid="invalidLanguages?.has(value as string) || undefined"
            v-bind="parts.language"
            @click="handleSelect(value as string)"
          >
            <slot
              v-bind="{ language, languages, value, label, parts, classes }"
            >
              <component
                v-if="outlets?.default"
                :is="outlets.default"
                v-bind="{ language, languages, value, label, parts, classes }"
              />
              <template v-else>
                {{ label }}
              </template>
            </slot>
          </button>
        </li>
      </ul>
    </div>
  </slot>
</template>
