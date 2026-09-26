import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  ResolvedLanguagesProp,
  DefineRegistryEntry,
} from '#core/types'
import type { VNode } from 'vue'
import {
  type LanguagesApi,
  type LanguagesProps,
  type LanguagesEmits,
  type LanguagesParts,
  type LanguagesSlots,
  type LanguagesExpose,
  type LanguagesClasses,
} from '#core/blueprints/languages'

/**
 * Props for the VfLanguages component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfLanguagesProps extends LanguagesProps<
  VfLanguagesSlots,
  VfLanguagesParts,
  VfLanguagesClasses,
  VfLanguagesContext
> {}

/**
 * Events emitted by the VfLanguages component.
 */
export interface VfLanguagesEmits extends LanguagesEmits<VfLanguagesContext> {}

/**
 * Slots available in the VfLanguages component.
 */
export interface VfLanguagesSlots extends LanguagesSlots<VfLanguagesContext> {
  /**
   * Slot that replaces each individual language option rendering.
   */
  default: (props: {
    parts: Partial<VfLanguagesParts>
    classes: VfLanguagesClasses
    language: string
    languages: ResolvedLanguagesProp
    value: string
    label: string
  }) => VNode[]
}
/**
 * Structural parts of the VfLanguages component.
 */
export interface VfLanguagesParts extends LanguagesParts {
  /**
   * The root language selector element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * The language list element.
   *
   * @tag ul
   */
  list: DomAttrsOf<'ul'>

  /**
   * Each language wrapper. Receives whether this option is currently selected
   * and whether this language has validation errors.
   *
   * @param selected Whether this language option is currently selected.
   * @param invalid Whether this language has validation errors.
   * @tag li
   */
  wrapper: (selected: boolean, invalid: boolean) => DomAttrsOf<'li'>

  /**
   * The language button element.
   *
   * @tag button
   */
  language: DomAttrsOf<'button'>
}

/**
 * CSS classes for the VfLanguages component's structural parts.
 */
export interface VfLanguagesClasses extends LanguagesClasses {
  /**
   * The root language selector element.
   */
  root: ClassValue

  /**
   * The language list element.
   */
  list: ClassValue

  /**
   * Each language wrapper.
   *
   * @param selected Whether this language option is currently selected.
   * @param invalid Whether this language has validation errors.
   */
  wrapper: (selected: boolean, invalid: boolean) => ClassValue

  /**
   * The language button element.
   */
  language: ClassValue
}

/**
 * Augmentable public API surface for VfLanguages.
 */
export interface VfLanguagesExpose extends LanguagesExpose {}

/**
 * Public context for VfLanguages.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfLanguagesContext extends DefineElementContext<
  VfLanguagesProps,
  VfLanguagesEmits,
  VfLanguagesSlots,
  VfLanguagesParts,
  VfLanguagesClasses,
  VfLanguagesExpose,
  LanguagesApi
> {}

/**
 * Registry entry for VfLanguages. `TEntry` is accepted for registry uniformity
 * but does not narrow anything — VfLanguages has no prop-driven generics.
 */
export interface VfLanguagesEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfLanguagesProps,
  VfLanguagesEmits,
  VfLanguagesSlots,
  VfLanguagesParts,
  VfLanguagesClasses,
  VfLanguagesContext
> {}
