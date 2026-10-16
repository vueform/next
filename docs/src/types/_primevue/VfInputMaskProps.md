```ts
/**
 * Generic props interface for the VfInputMask component, parameterized by the
 * model-driving type arguments (e.g. `VfInputMaskProps<true, typeof
 * languages>`). Reach for `VfInputMaskProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
