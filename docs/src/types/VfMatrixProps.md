```ts
/**
 * Props for the VfMatrix component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfMatrixProps extends MatrixProps<
  'matrix',
  VfMatrixSlots,
  VfMatrixParts,
  VfMatrixClasses,
  VfMatrixContext
> {}
```
