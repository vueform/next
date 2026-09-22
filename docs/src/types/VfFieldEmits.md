```ts
/**
 * Events emitted by the VfField component, parameterized by the model-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfFieldSlots`. Plain usage (`VfFieldEmits`) keeps
 * the context wide.
 */
interface VfFieldEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> extends FieldEmits<
  VfFieldContext<VfFieldProps<TTranslate, TLanguages, TNullValue>>
> {}
```
