import type {
  ClassValue,
  DomAttrsOf,
  EntryTranslateOf,
  EntryLanguagesOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  LanguagesProp,
  InputAriaA11y,
} from '@vueform/core'
import {
  type EditorProps as PvEditorProps,
  type EditorSlots as AEditorSlots,
} from 'primevue/editor'
import type { VNode } from 'vue'

import type {
  EditorA11y,
  EditorApi,
  EditorClasses,
  EditorEmits,
  EditorExpose,
  EditorModifiers,
  EditorParts,
  EditorProps,
  EditorSlots,
  forwards,
} from '#src/blueprints/editor'
import type { ForwardedSlots } from '#src/types'

/**
 * VfEditor props narrowed from a registry `TEntry` payload, applying the
 * entry's `translate` / `languages` props as generics (so `translate: true`
 * forces a locale-keyed `modelValue`).
 */
export type EntryProps<TEntry> = VfEditorProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

/**
 * Generic props interface for the VfEditor component, parameterized by the
 * model-driving type arguments (e.g. `VfEditorProps<true, typeof languages>`).
 * Reach for `VfEditorProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfEditorProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends EditorProps<
  'editor',
  TTranslate,
  TLanguages,
  VfEditorSlots<TTranslate, TLanguages>,
  VfEditorParts,
  VfEditorClasses,
  VfEditorContext<VfEditorProps<TTranslate, TLanguages>>
> {}

/**
 * Events emitted by the VfEditor component, parameterized by the model-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfEditorSlots`. Plain usage (`VfEditorEmits`)
 * keeps the context wide.
 */
export interface VfEditorEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends EditorEmits<VfEditorContext<VfEditorProps<TTranslate, TLanguages>>> {}

/**
 * Slots available in the VfEditor component.
 */
export interface VfEditorSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    EditorSlots<VfEditorContext<VfEditorProps<TTranslate, TLanguages>>>,
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
 * Structural parts of the VfEditor component.
 */
export interface VfEditorParts extends EditorParts {
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
 * CSS classes for the VfEditor component's structural parts.
 */
export interface VfEditorClasses extends EditorClasses {
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
 * Accessibility bindings of the VfEditor component, produced by the `inputAria`
 * pattern the component registers via `useA11y`.
 */
export interface VfEditorA11y extends EditorA11y, InputAriaA11y {}

/**
 * Styling modifiers of the VfEditor component.
 */
export interface VfEditorModifiers extends EditorModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The editor control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}

/**
 * Augmentable public API surface for VfEditor.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `EditorExpose` for all editor-based components) so they
 * appear on `ContextOf<'VfEditor'>` / `context$` / `defineExpose`.
 */
export interface VfEditorExpose extends EditorExpose {}

/**
 * Public context for VfEditor, optionally parameterized by concrete props (e.g.
 * `VfEditorContext<VfEditorProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfEditorContext<
  TProps extends WidenProps<VfEditorProps, EditorProps> = VfEditorProps,
> extends DefineElementContext<
  TProps,
  VfEditorEmits,
  VfEditorSlots,
  VfEditorParts,
  VfEditorClasses,
  VfEditorModifiers,
  VfEditorA11y,
  VfEditorExpose,
  EditorApi<TProps>
> {}

/**
 * Registry entry for VfEditor. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
export interface VfEditorEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfEditorEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfEditorSlots,
  VfEditorParts,
  VfEditorClasses,
  VfEditorContext<EntryProps<TEntry>>
> {}
