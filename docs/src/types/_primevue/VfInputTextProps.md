```ts
/**
 * Generic props interface for the VfInputText component, parameterized by the
 * model-driving type arguments (e.g. `VfInputTextProps<true, typeof
 * languages>`). Reach for `VfInputTextProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfInputTextProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends InputTextProps<
  'input-text',
  TTranslate,
  TLanguages,
  VfInputTextSlots<TTranslate, TLanguages>,
  VfInputTextParts,
  VfInputTextClasses,
  VfInputTextContext<VfInputTextProps<TTranslate, TLanguages>>
> {}
```
