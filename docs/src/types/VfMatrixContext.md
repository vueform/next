```ts
/**
 * Public context for VfMatrix, optionally parameterized by concrete props (e.g.
 * rows/cols/mode-narrowed `EntryProps` with a typed `modelValue`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfMatrixContext<
  TProps extends WidenProps<VfMatrixProps, MatrixProps<string>> = VfMatrixProps,
> extends DefineElementContext<
  TProps,
  VfMatrixEmits,
  VfMatrixSlots,
  VfMatrixParts,
  VfMatrixClasses,
  VfMatrixBindings,
  VfMatrixExpose,
  MatrixApi<TProps>
> {}
```
