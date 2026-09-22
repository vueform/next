```ts
/**
 * Props for the VfMatrix component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfMatrixProps extends MatrixProps<
  'matrix',
  VfMatrixSlots,
  VfMatrixParts,
  VfMatrixClasses,
  VfMatrixContext
> {}
```
