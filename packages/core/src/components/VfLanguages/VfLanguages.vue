<script setup lang="ts">
import { defaults, blueprint } from '#src/blueprints/languages'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

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

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  classes,
  useClasses,
  useBindings,
} = useBlueprint(blueprint, props, events, slots)

useClasses({
  root: 'vf-languages',
  list: 'vf-languages-wrapper',
  wrapper: 'vf-language-wrapper',
  language: 'vf-language',
})

useBindings({
  wrapper: (selected: boolean, invalid: boolean) => ({
    'data-selected': selected ? '' : undefined,
    'data-invalid': invalid ? '' : undefined,
  }),
})

const { languages, language, invalidLanguages } = propRefs
const { handleSelect } = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="bindings.root()">
      <!-- Plain buttons on purpose: tablist roles are a keyboard contract
        (roving tabindex, arrow keys) this component does not implement yet.
        aria-current marks the active language without promising tab
        semantics. -->
      <ul :class="classes.list" v-bind="bindings.list()">
        <li
          v-for="(label, value) in languages"
          :key="value"
          :class="classes.wrapper"
          v-bind="
            bindings.wrapper(
              language === value,
              !!invalidLanguages?.has(value as string)
            )
          "
        >
          <button
            type="button"
            :aria-current="language === value || undefined"
            :aria-invalid="invalidLanguages?.has(value as string) || undefined"
            :class="classes.language"
            v-bind="bindings.language()"
            @click="handleSelect(value as string)"
          >
            <slot :language :languages :value :label>
              <component
                v-if="outlets?.default"
                :is="outlets.default"
                :language
                :languages
                :value
                :label
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
