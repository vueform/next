```ts
/**
 * Generic props interface for the VfTextarea component, parameterized by the
 * model-driving type arguments (e.g. `VfTextareaProps<true, typeof
 * languages>`). Reach for `VfTextareaProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfTextareaProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends TextareaProps<
  'textarea',
  TTranslate,
  TLanguages,
  VfTextareaSlots<TTranslate, TLanguages>,
  VfTextareaParts,
  VfTextareaClasses,
  VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>
> {}
```
