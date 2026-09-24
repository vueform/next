<script setup lang="ts">
import { defaults, blueprint } from '@core/blueprints/languages'
import { useBlueprint } from '@core/composables'
import { defineEvents } from '@core/helpers'
import type {
  VfLanguagesEmits,
  VfLanguagesProps,
  VfLanguagesSlots,
} from './types'

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
  wrapper: (selected: boolean, invalid: boolean) => [
    'vf-language-wrapper',
    {
      'vf-selected': selected,
      'vf-invalid': invalid,
    },
  ],
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
      <ul :class="classes.list" role="tablist" v-bind="parts.list">
        <li
          v-for="(label, value) in languages"
          :class="
            classes.wrapper(
              language === value,
              !!invalidLanguages?.has(value as string)
            )
          "
          role="none"
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
            role="tab"
            :aria-selected="language === value"
            :aria-current="language === value"
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
