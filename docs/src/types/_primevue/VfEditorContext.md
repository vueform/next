```ts
/**
 * Public context for VfEditor, optionally parameterized by concrete props (e.g.
 * `VfEditorContext<VfEditorProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfEditorContext<
  TProps extends WidenProps<VfEditorProps, EditorProps> = VfEditorProps,
> extends DefineElementContext<
  TProps,
  VfEditorEmits,
  VfEditorSlots,
  VfEditorParts,
  VfEditorClasses,
  VfEditorExpose,
  EditorApi<TProps>
> {}
```
