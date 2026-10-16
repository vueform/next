```ts
/**
 * Props for the VfList component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfListProps extends ListProps<
  'list',
  VfListSlots,
  VfListParts,
  VfListClasses,
  VfListContext
> {}
```
