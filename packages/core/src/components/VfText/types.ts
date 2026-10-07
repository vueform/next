import {
  type TextApi,
  type TextClasses,
  type TextEmits,
  type TextExpose,
  type TextParts,
  type TextProps,
  type TextSlots,
} from '#src/blueprints/text'
import type {
  AddonsSlots,
  IconsClasses,
  IconsParts,
  IconsSlots,
  TranslateSlots,
  AddonsParts,
  TranslateParts,
  AddonGroupClasses,
  AddonGroupParts,
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
 * VfText props narrowed from a registry `TEntry` payload, applying the entry's
 * `translate` / `languages` props as generics (so `translate: true` forces a
 * locale-keyed `modelValue`).
 */
export type EntryProps<TEntry> = VfTextProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

/**
 * Generic props interface for the VfText component, parameterized by the
 * model-driving type arguments (e.g. `VfTextProps<true, typeof languages>`).
 * Reach for `VfTextProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfTextProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextProps<
  'text',
  TTranslate,
  TLanguages,
  VfTextSlots<TTranslate, TLanguages>,
  VfTextParts,
  VfTextClasses,
  VfTextContext<VfTextProps<TTranslate, TLanguages>>
> {}

/**
 * Events emitted by the VfText component, parameterized by the model-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfTextSlots`. Plain usage (`VfTextEmits`) keeps
 * the context wide.
 */
export interface VfTextEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextEmits<VfTextContext<VfTextProps<TTranslate, TLanguages>>> {}

/**
 * Slots available in the VfText component.
 */
export interface VfTextSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextSlots<VfTextContext<VfTextProps<TTranslate, TLanguages>>>,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}

/**
 * Structural parts of the VfText component.
 */
export interface VfTextParts
  extends TextParts, AddonsParts, AddonGroupParts, IconsParts, TranslateParts {
  /**
   * The text input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>
}

/**
 * CSS classes for the VfText component's structural parts.
 */
export interface VfTextClasses
  extends TextClasses, AddonGroupClasses, IconsClasses {
  /**
   * The text input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfText.
 */
export interface VfTextExpose extends TextExpose {}

/**
 * Public context for VfText, optionally parameterized by concrete props (e.g.
 * `VfTextContext<VfTextProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfTextContext<
  TProps extends WidenProps<VfTextProps, TextProps> = VfTextProps,
> extends DefineElementContext<
  TProps,
  VfTextEmits,
  VfTextSlots,
  VfTextParts,
  VfTextClasses,
  VfTextExpose,
  TextApi<TProps>
> {}

/**
 * Registry entry for VfText. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
export interface VfTextEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfTextEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfTextSlots,
  VfTextParts,
  VfTextClasses,
  VfTextContext<EntryProps<TEntry>>
> {}
