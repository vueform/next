```ts
/**
 * The raw items data after unwrapping functions and, when grouped, extracting
 * children via `groupChildren`. Falls back to the ungrouped items shape when
 * `groupChildren` is missing or not a valid group key.
 */
type FlatItemsData<TItems, TGroupChildren> = [TGroupChildren] extends [
  undefined | never,
]
  ? UnwrappedItems<TItems>
  : [ChildrenOfGroup<GroupOf<TItems>, TGroupChildren>] extends [never]
    ? UnwrappedItems<TItems>
    : ChildrenOfGroup<GroupOf<TItems>, TGroupChildren>
```
