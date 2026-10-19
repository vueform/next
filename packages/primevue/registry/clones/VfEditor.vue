<script
  setup
  lang="ts"
  generic="
    TTranslate extends boolean = false,
    TLanguages extends LanguagesProp = LanguagesProp
  "
>
/**
 * VfCloneName — a custom element created from Vueform's `editor` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  type LanguagesProp,
  inputAria,
  vdomPrime,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type ForwardedSlots,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type EditorApi,
  type EditorClasses,
  type EditorEmits,
  type EditorExpose,
  type EditorParts,
  type EditorProps,
  type EditorSlots,
  type forwards,
} from '@vueform/primevue/blueprints/editor'
import PrimeEditor, {
  type EditorSlots as AEditorSlots,
  type EditorProps as PvEditorProps,
} from 'primevue/editor'
import type { WritableComputedRef, VNode } from 'vue'

import '@vueform/primevue/editor.css'
import '@vueform/primevue/utils.css'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends EditorProps<
  '__TYPE__',
  TTranslate,
  TLanguages,
  VfCloneNameSlots<TTranslate, TLanguages>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages>>
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends EditorEmits<
  VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages>>
> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    EditorSlots<VfCloneNameContext<VfCloneNameProps<TTranslate, TLanguages>>>,
    /* @vue-ignore */ ForwardedSlots<
      AEditorSlots,
      (typeof forwards.slots)[number]
    > {
  /**
   * Custom editor toolbar content.
   *
   * @param scope The toolbar slot's params.
   */
  toolbar: (scope: {
    /**
     * Available language labels keyed by locale code.
     */
    languages: Record<string, string>

    /**
     * The currently active language code.
     */
    language: string
  }) => VNode[]
}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends EditorParts {
  /**
   * The editor element.
   *
   * @tag Editor
   */
  input: PvEditorProps

  /**
   * The loading-skeleton placeholder shown until the editor module loads.
   *
   * @tag div
   */
  placeholder: DomAttrsOf<'div'>

  /**
   * The loading-skeleton toolbar area.
   *
   * @tag div
   */
  placeholderToolbar: DomAttrsOf<'div'>

  /**
   * The loading-skeleton content area.
   *
   * @tag div
   */
  placeholderContent: DomAttrsOf<'div'>
}

/**
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/primevue').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/primevue').ClassValue
 *
 * @see https://primevue.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends EditorClasses {
  /**
   * The editor element.
   */
  input: ClassValue

  /**
   * The placeholder skeleton shown while the editor is loading.
   */
  placeholder: ClassValue

  /**
   * The toolbar area of the loading placeholder.
   */
  placeholderToolbar: ClassValue

  /**
   * The content area of the loading placeholder.
   */
  placeholderContent: ClassValue
}

/**
 * Custom exposed API members. Add props you return from useBlueprint's
 * 5th 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://primevue.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends EditorExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, EditorProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfEditorModifiers,
  VfEditorA11y,
  VfCloneNameExpose,
  EditorApi<TProps>
> {}

const Editor = vdomPrime(PrimeEditor)

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.translate ? {} : null),
})
defineEmits<VfCloneNameEmits<TTranslate, TLanguages>>()

const props = withDefaults(
  defineProps<VfCloneNameProps<TTranslate, TLanguages>>(),
  {
    ...defaults,
    type: '__TYPE__',
  }
)
const events = defineEvents<VfCloneNameEmits<TTranslate, TLanguages>>()
const slots = defineSlots<VfCloneNameSlots<TTranslate, TLanguages>>()

/**
 * Extend the element's API by passing a 5th 'extend' callback to
 * useBlueprint — whatever it returns merges into the api / expose
 * (declare the members on VfCloneNameExpose above).
 *
 * @example
 *   useBlueprint(blueprint, props, events, slots, () => ({
 *     plain: '',
 *     vueRef: ref(''),
 *     method: (arg1: any, arg2: any) => '',
 *   }))
 *
 * @see https://primevue.vueform.com/guide/components#extending-the-logic
 */
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

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
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
  inputRef,
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

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryLanguagesOf,
  EntryTranslateOf,
} from '@vueform/primevue'

type EntryProps<TEntry> = VfCloneNameProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
      VfCloneNameSlots,
      VfCloneNameParts,
      VfCloneNameClasses,
      VfCloneNameContext<EntryProps<TEntry>>
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCloneName: (typeof import('./VfCloneName.vue'))['default']
  }
}
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
        :ref="(el) => (inputRef = el)"
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
