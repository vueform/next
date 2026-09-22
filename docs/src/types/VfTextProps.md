```ts
/**
 * Generic props interface for the VfText component, parameterized by the
 * model-driving type arguments (e.g. `VfTextProps<true, typeof languages>`).
 * Reach for `VfTextProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfTextProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextProps<
  'text',
  TTranslate,
  TLanguages,
  VfTextSlots<TTranslate, TLanguages>,
  VfTextParts,
  VfTextClasses,
  VfTextContext<VfTextProps<TTranslate, TLanguages>>
> {}
```
