```ts
/**
 * Generic props interface for the VfEditor component, parameterized by the
 * model-driving type arguments (e.g. `VfEditorProps<true, typeof languages>`).
 * Reach for `VfEditorProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfEditorProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends EditorProps<
  'editor',
  TTranslate,
  TLanguages,
  VfEditorSlots<TTranslate, TLanguages>,
  VfEditorParts,
  VfEditorClasses,
  VfEditorContext<VfEditorProps<TTranslate, TLanguages>>
> {}
```
