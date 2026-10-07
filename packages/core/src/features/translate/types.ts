import type { VNode } from 'vue'

import { type LanguagesProp, type PartOf, type EntryPropOf } from '#src/types'

// ========== ENTRY GENERICS ============

/**
 * Resolves the `TTranslate` generic from a registry `TEntry` payload's
 * `translate` prop. Missing / invalid values fall back to `false` (the runtime
 * default); wide payloads (`any`) resolve to `boolean`.
 */
export type EntryTranslateOf<TEntry> =
  EntryPropOf<TEntry, 'translate'> extends infer T
    ? T extends boolean
      ? T
      : false
    : false

/**
 * Resolves the `TLanguages` generic from a registry `TEntry` payload's
 * `languages` prop, falling back to the wide `LanguagesProp` when absent — so
 * `translate: true` without `languages` yields a `string`-keyed model.
 */
export type EntryLanguagesOf<TEntry> =
  EntryPropOf<TEntry, 'languages'> extends infer L
    ? L extends LanguagesProp
      ? L
      : LanguagesProp
    : LanguagesProp

/**
 * Props for elements that support multilingual/translatable values,
 * parameterized by the model-driving type arguments (`translate` /
 * `languages`). Plain usage (`TranslateProps`) keeps every member wide.
 */
export interface TranslateProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> {
  /**
   * Whether the element's value is translatable into multiple languages.
   */
  translate?: TTranslate | boolean

  /**
   * The default selected language.
   */
  language?: string

  /**
   * The available languages for translatable content.
   */
  languages?: TLanguages
}

/**
 * The model value type for a translatable element, derived from the `translate`
 * / `languages` props (and optional scalar `TScalar`, defaulting to `string |
 * number | null`):
 *
 * - `translate` unset or still the wide `boolean` — `TScalar` or a locale-keyed
 *   object of `TScalar` values (matches `TranslatableModel` for the default
 *   scalar).
 * - `translate: false` — `TScalar` only.
 * - `translate: true` — a locale-keyed object; keyed by the concrete `languages`
 *   prop keys when one is provided, otherwise `string` keys.
 *
 * Locale keys are optional — this is the input-side shape. The element
 * initializes missing languages at runtime, so the element's `model` (see
 * `MakeDataReturnTranslatable`) carries every key required.
 */
export type TranslateModel<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TScalar = string | number | null,
> = [boolean] extends [TTranslate]
  ? TScalar | Record<string, TScalar | undefined>
  : [TTranslate] extends [true]
    ? [LanguagesProp] extends [TLanguages]
      ? Record<string, TScalar>
      : { [K in keyof TLanguages]?: TScalar }
    : TScalar

/**
 * Model / default prop type for translatable elements.
 *
 * Wrapped in `NoInfer` so `modelValue` / `default` / `v-model` do not compete
 * with the `translate` / `languages` / scalar-driving props when inferring the
 * generics (mirrors `ItemsModelProp`).
 */
export type TranslateModelProp<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TScalar = string | number | null,
> = NoInfer<TranslateModel<TTranslate, TLanguages, TScalar>>

/**
 * Slot definitions for multilingual elements.
 */
export interface TranslateSlots {
  /**
   * Slot that replaces the language selector rendering.
   *
   * @param props.language The currently active language code.
   * @param props.languages The available languages map.
   */
  language: (props: { language: string; languages: LanguagesProp }) => VNode[]
}

/**
 * Part definitions for multilingual elements.
 */
export interface TranslateParts {
  /**
   * The language selector addon rendered alongside the input.
   *
   * @tag VfAddon
   */
  language: PartOf<'VfAddon'>
}
