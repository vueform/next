```ts
/**
 * Props for the VfList component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
interface VfListProps extends ListProps<
  'list',
  VfListSlots,
  VfListParts,
  VfListClasses,
  VfListContext
> {}
```
