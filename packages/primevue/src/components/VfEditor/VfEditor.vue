<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
import { defineEvents, useBlueprint, type LanguagesProp } from '@vueform/core'
import PrimeEditor from 'primevue/editor'
import type { WritableComputedRef } from 'vue'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/editor'
import { vdomPrime } from '#src/helpers'

import type { VfEditorEmits, VfEditorProps, VfEditorSlots } from './types'

const Editor = vdomPrime(PrimeEditor)

defineOptions({
  name: 'VfEditor',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfEditorEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfEditorProps<TTranslate, TLanguages>>(),
  defaults
)
const events = defineEvents<VfEditorEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfEditorSlots<TTranslate, TLanguages>>()

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-editor',
  input: {
    'vf-editor-input': true,
    'vf-editor-loading': !api.ready.value,
    [api.editorClass.value]: !!api.editorCss.value,
  },
  placeholder: {
    'vf-editor-placeholder': true,
    [api.editorClass.value]: !!api.editorCss.value,
  },
  placeholderContent: 'vf-editor-placeholder-content',
  placeholderToolbar: 'vf-editor-placeholder-toolbar',
}))

useModifiers(({ hasError }) => ({
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

const { editorStyle } = propRefs

const {
  value,
  name,
  readonly,
  placeholder,
  viewLoaded,
  invalid,
  input,
  forwardProps,
  forwardSlots,
  editorCss,
  nonce,
  ready,
  modules,
  languages,
  language,
  translatable,
  handleInput,
  handleLoad,
} = api

/**
 * PrimeVue Editor types `modelValue` as `string | undefined`. The element's
 * `value` is the active-language scalar, which is the same runtime binding as
 * before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<string | undefined>

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :languages="false">
      <div v-if="!ready" v-bind="bindings.placeholder">
        <div v-bind="bindings.placeholderToolbar">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div
          v-bind="bindings.placeholderContent"
          :style="editorStyle"
          data-editor-placeholder-content
        />
      </div>
      <Editor
        :name
        v-model="inputValue"
        :editor-style
        :placeholder
        :readonly
        :invalid
        :modules
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (input = el)"
        @load="handleLoad"
        @value-change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
        <template #toolbar>
          <slot name="toolbar" :languages :language>
            <component
              v-if="outlets.toolbar"
              :is="outlets.toolbar"
              :languages
              :language
            />
            <div v-else-if="modules" class="vf-passthrough" />
            <template v-else>
              <span class="ql-formats">
                <select
                  v-if="translatable"
                  class="ql-vflanguage"
                  aria-label="Editing language"
                  v-model="language"
                >
                  <option
                    v-for="(label, code) in languages"
                    :key="code"
                    :value="code"
                  >
                    {{ label }}
                  </option>
                </select>
                <select
                  class="ql-header"
                  defaultValue="0"
                  aria-label="Heading level"
                >
                  <option value="1">Heading</option>
                  <option value="2">Subheading</option>
                  <option value="0">Normal</option>
                </select>
                <select class="ql-font" aria-label="Font">
                  <option />
                  <option value="serif" />
                  <option value="monospace" />
                </select>
              </span>
              <span class="ql-formats">
                <button class="ql-bold" type="button" />
                <button class="ql-italic" type="button" />
                <button class="ql-underline" type="button" />
              </span>
              <span class="ql-formats">
                <select class="ql-color" aria-label="Text color" />
                <select class="ql-background" aria-label="Background color" />
              </span>
              <span class="ql-formats">
                <button class="ql-list" value="ordered" type="button" />
                <button class="ql-list" value="bullet" type="button" />
                <select class="ql-align" aria-label="Text alignment">
                  <option defaultValue />
                  <option value="center" />
                  <option value="right" />
                  <option value="justify" />
                </select>
              </span>
              <span class="ql-formats">
                <button class="ql-link" type="button" />
                <button class="ql-image" type="button" />
                <button class="ql-code-block" type="button" />
              </span>
              <span class="ql-formats">
                <button class="ql-clean" type="button" />
              </span>
            </template>
          </slot>
        </template>
      </Editor>
      <component v-if="editorCss" :is="'style'" :nonce.attr="nonce">
        {{ editorCss }}
      </component>
    </VfLayout>
  </slot>
</template>
