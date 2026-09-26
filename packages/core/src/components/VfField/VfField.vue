<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp,
    TNullValue = [TTranslate] extends [true] ? string | number | null : any
  "
>
import type { LanguagesProp } from '#core/types'
import type { VfFieldEmits, VfFieldProps, VfFieldSlots } from './types'
import { defaults, blueprint } from '#core/blueprints/field'
import { useBlueprint } from '#core/composables'
import { defineEvents } from '#core/helpers'

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

const { api, context, expose, outlets, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

useClasses(() => ({
  root: {
    'vf-field': true,
    'vf-align-label': !api.help.value,
  },
  addonGroup: 'vf-addon-group',
  iconGroup: 'vf-icon-group',
}))

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
