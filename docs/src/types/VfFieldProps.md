```ts
/**
 * Generic props interface for the VfField component, parameterized by the
 * model-driving type arguments (e.g. `VfFieldProps<true, typeof languages>` /
 * `VfFieldProps<false, LanguagesProp, 0>`). `nullValue` types one value: the
 * model when `translate` is false, each language's entry when it is true. Reach
 * for `VfFieldProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfFieldProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> extends FieldProps<
  'field',
  TTranslate,
  TLanguages,
  TNullValue,
  VfFieldSlots<TTranslate, TLanguages, TNullValue>,
  VfFieldParts,
  VfFieldClasses,
  VfFieldContext<VfFieldProps<TTranslate, TLanguages, TNullValue>>
> {}
```
