```ts
/**
 * Events emitted by the VfEditor component, parameterized by the model-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfEditorSlots`. Plain usage (`VfEditorEmits`)
 * keeps the context wide.
 */
interface VfEditorEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends EditorEmits<VfEditorContext<VfEditorProps<TTranslate, TLanguages>>> {}
```
