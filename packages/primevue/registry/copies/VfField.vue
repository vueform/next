<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp,
    TNullValue = [TTranslate] extends [true] ? string | number | null : any
  "
>
/**
 * Local copy of VfField of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  defineEvents,
  type LanguagesProp,
} from '@vueform/primevue'
import {
  defaults,
  blueprint,
  type VfFieldEmits,
  type VfFieldProps,
  type VfFieldSlots,
} from '@vueform/primevue/components/VfField'

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
  root: 'vf-field',
  addonGroup: 'vf-addon-group',
  iconGroup: 'vf-icon-group',
}))

const { viewLoaded, a11yBindings } = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <slot :context :a11y-bindings="a11yBindings">
        <component
          v-if="outlets?.default"
          :is="outlets.default"
          :context
          :a11y-bindings="a11yBindings"
        />
      </slot>
    </VfLayout>
  </slot>
</template>
