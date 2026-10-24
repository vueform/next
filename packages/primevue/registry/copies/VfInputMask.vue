<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
/**
 * Local copy of VfInputMask of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type LanguagesProp,
  tInputAria,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfInputMaskEmits,
  type VfInputMaskProps,
  type VfInputMaskSlots,
} from '@vueform/primevue/components/VfInputMask'
import PrimeInputMask from 'primevue/inputmask'

const InputMask = vdomPrime(PrimeInputMask)

defineOptions({
  name: 'VfInputMask',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfInputMaskEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfInputMaskProps<TTranslate, TLanguages>>(),
  defaults
)
const events = defineEvents<VfInputMaskEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfInputMaskSlots<TTranslate, TLanguages>>()

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: 'vf-input-mask',
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  tInputAria(api)
)

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  inputRef,
  name,
  tooltipModifiers,
  tooltipValue,
  invalid,
  mask,
  forwardProps,
  forwardSlots,
  handleKeydown,
  handleKeypress,
  handleInput,
  handleFocus,
  handleBlur,
} = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <InputMask
        :name
        :id
        :mask
        v-model="value"
        :placeholder
        :disabled
        :readonly
        :invalid
        fluid
        :class="classes.input || undefined"
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{ ...forwardProps, ...bindings.input() }"
        :ref="(el) => (inputRef = el)"
        @keydown="handleKeydown"
        @keypress="handleKeypress"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </InputMask>
    </VfLayout>
  </slot>
</template>
