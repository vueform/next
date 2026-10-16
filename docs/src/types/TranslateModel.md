```ts
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
type TranslateModel<
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
```
