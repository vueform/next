```ts
/**
 * Events emitted by the VfPassword component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfPasswordSlots`. Plain usage
 * (`VfPasswordEmits`) keeps the context wide.
 */
interface VfPasswordEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends PasswordEmits<
  VfPasswordContext<VfPasswordProps<TTranslate, TLanguages>>
> {}
```
