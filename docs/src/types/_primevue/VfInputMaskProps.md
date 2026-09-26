```ts
/**
 * Generic props interface for the VfInputMask component, parameterized by the
 * model-driving type arguments (e.g. `VfInputMaskProps<true, typeof
 * languages>`). Reach for `VfInputMaskProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfInputMaskProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends InputMaskProps<
  'input-mask',
  TTranslate,
  TLanguages,
  VfInputMaskSlots<TTranslate, TLanguages>,
  VfInputMaskParts,
  VfInputMaskClasses,
  VfInputMaskContext<VfInputMaskProps<TTranslate, TLanguages>>
> {}
```
