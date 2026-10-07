import {
  type TextareaApi,
  type TextareaClasses,
  type TextareaEmits,
  type TextareaExpose,
  type TextareaParts,
  type TextareaProps,
  type TextareaSlots,
} from '#src/blueprints/textarea'
import type {
  AddonsParts,
  AddonsSlots,
  IconsClasses,
  IconsParts,
  IconsSlots,
  AddonGroupClasses,
  TranslateParts,
  TranslateSlots,
  EntryTranslateOf,
  EntryLanguagesOf,
} from '#src/features'
import type {
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  ClassValue,
  DomAttrsOf,
  LanguagesProp,
} from '#src/types'

/**
 * VfTextarea props narrowed from a registry `TEntry` payload, applying the
 * entry's `translate` / `languages` props as generics (so `translate: true`
 * forces a locale-keyed `modelValue`).
 */
export type EntryProps<TEntry> = VfTextareaProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

/**
 * Generic props interface for the VfTextarea component, parameterized by the
 * model-driving type arguments (e.g. `VfTextareaProps<true, typeof
 * languages>`). Reach for `VfTextareaProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfTextareaProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextareaProps<
  'textarea',
  TTranslate,
  TLanguages,
  VfTextareaSlots<TTranslate, TLanguages>,
  VfTextareaParts,
  VfTextareaClasses,
  VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>
> {}

/**
 * Events emitted by the VfTextarea component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfTextareaSlots`. Plain usage
 * (`VfTextareaEmits`) keeps the context wide.
 */
export interface VfTextareaEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextareaEmits<
  VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>
> {}

/**
 * Slots available in the VfTextarea component.
 */
export interface VfTextareaSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextareaSlots<VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>>,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}

/**
 * Structural parts of the VfTextarea component.
 */
export interface VfTextareaParts
  extends TextareaParts, AddonsParts, IconsParts, TranslateParts {
  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>

  /**
   * The textarea element.
   *
   * @tag textarea
   */
  input: DomAttrsOf<'textarea'>
}

/**
 * CSS classes for the VfTextarea component's structural parts.
 */
export interface VfTextareaClasses
  extends TextareaClasses, AddonGroupClasses, IconsClasses {
  /**
   * The textarea element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfTextarea.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `TextareaExpose` for all textarea-based components) so
 * they appear on `ContextOf<'VfTextarea'>` / `context$` / `defineExpose`.
 */
export interface VfTextareaExpose extends TextareaExpose {}

/**
 * Public context for VfTextarea, optionally parameterized by concrete props
 * (e.g. `VfTextareaContext<VfTextareaProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfTextareaContext<
  TProps extends WidenProps<VfTextareaProps, TextareaProps> = VfTextareaProps,
> extends DefineElementContext<
  TProps,
  VfTextareaEmits,
  VfTextareaSlots,
  VfTextareaParts,
  VfTextareaClasses,
  VfTextareaExpose,
  TextareaApi<TProps>
> {}

/**
 * Registry entry for VfTextarea. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfTextareaEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfTextareaEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfTextareaSlots,
  VfTextareaParts,
  VfTextareaClasses,
  VfTextareaContext<EntryProps<TEntry>>
> {}
