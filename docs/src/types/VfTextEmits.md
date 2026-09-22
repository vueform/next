```ts
/**
 * Events emitted by the VfText component, parameterized by the model-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfTextSlots`. Plain usage (`VfTextEmits`) keeps
 * the context wide.
 */
interface VfTextEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextEmits<VfTextContext<VfTextProps<TTranslate, TLanguages>>> {}
```
