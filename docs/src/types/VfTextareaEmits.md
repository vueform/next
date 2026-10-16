```ts
/**
 * Events emitted by the VfTextarea component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfTextareaSlots`. Plain usage
 * (`VfTextareaEmits`) keeps the context wide.
 */
interface VfTextareaEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextareaEmits<
  VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>
> {}
```
