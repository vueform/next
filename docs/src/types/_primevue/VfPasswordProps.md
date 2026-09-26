```ts
/**
 * Generic props interface for the VfPassword component, parameterized by the
 * model-driving type arguments (e.g. `VfPasswordProps<true, typeof
 * languages>`). Reach for `VfPasswordProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfPasswordProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends PasswordProps<
  'password',
  TTranslate,
  TLanguages,
  VfPasswordSlots<TTranslate, TLanguages>,
  VfPasswordParts,
  VfPasswordClasses,
  VfPasswordContext<VfPasswordProps<TTranslate, TLanguages>>
> {}
```
