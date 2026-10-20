<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp,
    TNullValue = [TTranslate] extends [true] ? string | number | null : any
  "
>
import { inputAria } from '#src/a11y'
import { defaults, blueprint } from '#src/blueprints/field'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'
import type { LanguagesProp } from '#src/types'

import type { VfFieldEmits, VfFieldProps, VfFieldSlots } from './types'

defineOptions({
  name: 'VfField',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => props.nullValue ?? null,
})
defineEmits<VfFieldEmits<TTranslate, TLanguages, TNullValue>>()

const props = withDefaults(
  defineProps<VfFieldProps<TTranslate, TLanguages, TNullValue>>(),
  defaults
)
const events = defineEvents<VfFieldEmits<TTranslate, TLanguages, TNullValue>>()
const slots = defineSlots<VfFieldSlots<TTranslate, TLanguages, TNullValue>>()

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

useClasses({
  root: 'vf-field',
})

useBindings(inputAria(api))

const { viewLoaded } = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <slot :context>
        <component v-if="outlets?.default" :is="outlets.default" :context />
      </slot>
    </VfLayout>
  </slot>
</template>
