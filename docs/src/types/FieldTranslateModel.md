```ts
/**
 * Field model shape. `TNullValue` always types **one value** — the model itself
 * when not translating, the per-language entry when translating:
 *
 * - `translate: false` — the `nullValue` prop type (default `null` on the SFC).
 * - `translate: true` — a locale-keyed object of `TNullValue` entries (the SFC
 *   defaults `TNullValue` to the text scalar `string | number | null` here).
 * - `translate` wide/unset — union of both.
 */
type FieldTranslateModel<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> = [boolean] extends [TTranslate]
  ? | FieldNullValue<TNullValue>
    | TranslateModel<boolean, TLanguages, FieldNullValue<TNullValue>>
  : [TTranslate] extends [true]
    ? TranslateModel<true, TLanguages, FieldNullValue<TNullValue>>
    : FieldNullValue<TNullValue>
```
