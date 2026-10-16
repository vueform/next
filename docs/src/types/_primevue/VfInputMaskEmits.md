```ts
/**
 * Events emitted by the VfInputMask component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfInputMaskSlots`. Plain usage
 * (`VfInputMaskEmits`) keeps the context wide.
 */
interface VfInputMaskEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends InputMaskEmits<
  VfInputMaskContext<VfInputMaskProps<TTranslate, TLanguages>>
> {}
```
