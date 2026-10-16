```ts
/**
 * Props for the VfMatrix component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfMatrixProps extends MatrixProps<
  'matrix',
  VfMatrixSlots,
  VfMatrixParts,
  VfMatrixClasses,
  VfMatrixContext
> {}
```
