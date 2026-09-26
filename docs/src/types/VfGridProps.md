```ts
/**
 * Props for the VfGrid component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfGridProps extends GridProps<
  'grid',
  VfGridSlots,
  VfGridParts,
  VfGridClasses,
  VfGridContext
> {}
```
