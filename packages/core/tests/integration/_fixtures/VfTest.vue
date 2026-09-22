<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import {
  defineEvents,
  AddonsSlots,
  IconsClasses,
  IconsParts,
  IconsSlots,
  TranslateSlots,
  AddonsParts,
  TranslateParts,
  AddonGroupClasses,
  AddonGroupParts,
  ClassValue,
  DomAttrsOf,
  PartProps,
  ClassProps,
  ReclassProps,
  useBlueprint,
  type WidenProps,
  type DefineElementContext,
  type LanguagesProp,
} from '@vueform/core'
import {
  blueprint,
  defaults,
  type TextProps,
  type TextSlots,
  type TextClasses,
  type TextEmits,
  type TextExpose,
  type TextParts,
  type TextApi,
} from '@vueform/core/blueprints/text'

export type VfTestProps = WidenProps<VfTestGenericProps, TextProps<string>>

export interface VfTestGenericProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextProps<
      'test',
      TTranslate,
      TLanguages,
      VfTestSlots<TTranslate, TLanguages>,
      VfTestParts,
      VfTestClasses,
      VfTestContext
    >,
    /* @vue-ignore */ PartProps<VfTestParts, VfTestContext>,
    /* @vue-ignore */ ClassProps<VfTestClasses, VfTestContext>,
    /* @vue-ignore */ ReclassProps<VfTestClasses, VfTestContext> {
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
> extends TextEmits<
  VfTestContext<VfTestGenericProps<TTranslate, TLanguages>>
> {}

export interface VfTestSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextSlots<VfTestContext<VfTestGenericProps<TTranslate, TLanguages>>>,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}

export interface VfTestParts
  extends TextParts, AddonsParts, AddonGroupParts, IconsParts, TranslateParts {
  /**
   * The text input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>
}

export interface VfTestClasses
  extends TextClasses, AddonGroupClasses, IconsClasses {
  root: ClassValue
  input: (foo: string, bar: number) => ClassValue
  foo: ClassValue
  bar: ClassValue
  baz: ClassValue
  qux: ClassValue
  quux: ClassValue
  corge: ClassValue
  grault: ClassValue
}

export interface VfTestExpose extends TextExpose {}

export interface VfTestContext<
  TProps extends VfTestProps = VfTestGenericProps,
> extends DefineElementContext<
  TProps,
  VfTestEmits,
  VfTestSlots,
  VfTestParts,
  VfTestClasses,
  VfTestExpose,
  TextApi<TProps>
> {}

defineOptions({ name: 'VfTest', element: true, inheritAttrs: false })
defineEmits<VfTestEmits<TTranslate, TLanguages>>()

// Factory defaults that depend on other props (or must not be shared) go through
// Vue's withDefaults — same path as production blueprints.
const props = withDefaults(
  defineProps<VfTestGenericProps<TTranslate, TLanguages>>(),
  {
    ...defaults,
    type: 'test',
    testStatic: 'static-default',
    testDerived: (props) => `${props.testSource}-derived`,
    testFn: (value: string) => `fn-${value}`,
    testObj: () => ({ a: 1, b: 2 }),
    testArr: () => ['a', 'b'],
    presets: (props) => props.testPresets ?? [],
  }
)
const events = defineEvents<VfTestEmits>()
const slots = defineSlots<VfTestSlots<TTranslate, TLanguages>>()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  aria,
  input,
  name,
  handleKeydown,
  handleKeyup,
  handleKeypress,
  handleInput,
  handleFocus,
  handleBlur,
} = api

const { inputType, autocomplete } = propRefs

useClasses(({ disabled, focused, success, hasError }) => ({
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

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context="context">
    <component
      v-if="outlets.template"
      :is="outlets.template"
      :context="context"
    />
    <VfLayout v-else-if="viewLoaded">
      <input
        :type="inputType"
        :name
        :id
        :class="classes.input('foo', 123)"
        v-model="value"
        :placeholder
        :autocomplete
        :disabled
        :readonly
        v-bind="{
          ...aria,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @keypress="handleKeypress"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <div :class="classes.foo" />
      <div :class="classes.bar" />
      <div :class="classes.baz" />
      <div :class="classes.qux" />
      <div :class="classes.quux" />
      <div :class="classes.corge" />
      <div :class="classes.grault" />
    </VfLayout>
  </slot>
</template>

<script lang="ts">
declare module '@vueform/core' {
  interface ControlDefinitions {
    VfTest: any
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfTest: (typeof import('./VfTest.vue'))['default']
  }
}
</script>
