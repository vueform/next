<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import {
  useBlueprint,
  defineEvents,
  tInputAria,
  type TAriaA11y,
  type LanguagesProp,
  type AddonGroupClasses,
  type AddonGroupParts,
  type AddonsParts,
  type AddonsSlots,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type IconsClasses,
  type IconsParts,
  type IconsSlots,
  type TranslateParts,
  type TranslateSlots,
  type WidenProps,
} from '@vueform/core'
import {
  defaults,
  blueprint,
  type TextA11y,
  type TextApi,
  type TextClasses,
  type TextEmits,
  type TextExpose,
  type TextModifiers,
  type TextParts,
  type TextProps,
  type TextSlots,
} from '@vueform/core/blueprints/text'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfTestProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextProps<
  'test',
  TTranslate,
  TLanguages,
  VfTestSlots<TTranslate, TLanguages>,
  VfTestParts,
  VfTestClasses,
  VfTestContext<VfTestProps<TTranslate, TLanguages>>
> {
  /**
   * Source prop that factory defaults derive from in tests.
   */
  testSource?: string

  /**
   * Prop with a static blueprint default.
   */
  testStatic?: string

  /**
   * Prop whose default is derived from `testSource` via a factory default.
   */
  testDerived?: string

  /**
   * Function-typed prop whose blueprint default is a function value that must
   * not be executed as a factory.
   */
  testFn?: (value: string) => string

  /**
   * Object-typed prop with a factory default.
   */
  testObj?: Record<string, any>

  /**
   * Array-typed prop with a factory default.
   */
  testArr?: string[]

  /**
   * Preset names activated through blueprint defaults.
   */
  testPresets?: string[]
}

export interface VfTestEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextEmits<VfTestContext<VfTestProps<TTranslate, TLanguages>>> {}

export interface VfTestSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextSlots<VfTestContext<VfTestProps<TTranslate, TLanguages>>>,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}

export interface VfTestParts
  extends TextParts, AddonsParts, AddonGroupParts, IconsParts, TranslateParts {
  input: DomAttrsOf<'input'>
  // Synthetic parts backing the pipeline-exercise class keys below.
  foo: DomAttrsOf<'div'>
  bar: DomAttrsOf<'div'>
  baz: DomAttrsOf<'div'>
  qux: DomAttrsOf<'div'>
  quux: DomAttrsOf<'div'>
  corge: DomAttrsOf<'div'>
  grault: DomAttrsOf<'div'>
}

export interface VfTestClasses
  extends TextClasses, AddonGroupClasses, IconsClasses {
  input: (foo: string, bar: number) => ClassValue
  foo: ClassValue
  bar: ClassValue
  baz: ClassValue
  qux: ClassValue
  quux: ClassValue
  corge: ClassValue
  grault: ClassValue
}

/**
 * Accessibility bindings of the VfTest component, produced by the `tInputAria`
 * pattern the component registers via `useA11y`.
 */
export interface VfTestA11y extends TextA11y, TAriaA11y {}

export interface VfTestExpose extends TextExpose {}

export interface VfTestContext<
  TProps extends WidenProps<VfTestProps, TextProps<string>> = VfTestProps,
> extends DefineElementContext<
  TProps,
  VfTestEmits,
  VfTestSlots,
  VfTestParts,
  VfTestClasses,
  TextModifiers,
  VfTestA11y,
  VfTestExpose,
  TextApi<TProps>
> {}

defineOptions({
  name: 'VfTest',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfTestEmits<TTranslate, TLanguages>>()

const props = withDefaults(defineProps<VfTestProps<TTranslate, TLanguages>>(), {
  ...defaults,
  type: 'test',
  testStatic: 'static-default',
  testDerived: (props) => `${props.testSource}-derived`,
  testFn: (value: string) => `fn-${value}`,
  testObj: () => ({ a: 1, b: 2 }),
  testArr: () => ['a', 'b'],
  presets: (props) => props.testPresets ?? [],
})
const events = defineEvents<VfTestEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfTestSlots<TTranslate, TLanguages>>()

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(({ success, focused, hasError }) => ({
  root: 'vf-text vf-offset-label',
  input: (foo: string, bar: number) => ({
    [`vf-${foo} vf-${bar}`]: true,
    'vf-disabled': disabled.value,
    'vf-focused': focused.value,
    'vf-success': success.value,
    'vf-danger': hasError.value,
  }),
  foo: 'foo',
  bar: 'bar',
  baz: 'baz',
  qux: 'qux',
  quux: 'quux',
  corge: 'corge',
  grault: 'grault',
}))

useA11y(tInputAria())

const {
  value,
  id,
  loading,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  input,
  name,
  handleKeydown,
  handleKeyup,
  handleKeypress,
  handleFocus,
  handleBlur,
  handleInput,
} = api

const { inputType, autocomplete } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :loading>
      <input
        :type="inputType"
        :name
        :id
        v-model="value"
        :placeholder
        :autocomplete
        :disabled
        :readonly="readonly || undefined"
        v-bind="bindings.input('foo', 123)"
        :ref="(el) => (input = el)"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @keypress="handleKeypress"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />
      <div v-bind="bindings.foo" />
      <div v-bind="bindings.bar" />
      <div v-bind="bindings.baz" />
      <div v-bind="bindings.qux" />
      <div v-bind="bindings.quux" />
      <div v-bind="bindings.corge" />
      <div v-bind="bindings.grault" />
    </VfLayout>
  </slot>
</template>
