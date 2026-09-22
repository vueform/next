```ts
/**
 * Events emitted by the VfInputText component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfInputTextSlots`. Plain usage
 * (`VfInputTextEmits`) keeps the context wide.
 */
interface VfInputTextEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends InputTextEmits<
  VfInputTextContext<VfInputTextProps<TTranslate, TLanguages>>
> {}
```
