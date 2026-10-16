```ts
/**
 * Props for the VfGrid component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfGridProps extends GridProps<
  'grid',
  VfGridSlots,
  VfGridParts,
  VfGridClasses,
  VfGridContext
> {}
```
