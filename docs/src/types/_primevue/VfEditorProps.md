```ts
/**
 * Generic props interface for the VfEditor component, parameterized by the
 * model-driving type arguments (e.g. `VfEditorProps<true, typeof languages>`).
 * Reach for `VfEditorProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
