```ts
/**
 * Resolves the children collection from a group via a `groupChildren` key or
 * mapping function. Returns `never` when the key is not present on the group
 * (so invalid `groupChildren` values do not poison item inference).
 */
type ChildrenOfGroup<TGroup, TGroupChildren> = TGroupChildren extends
  | undefined
  | never
  ? never
  : TGroupChildren extends keyof TGroup
    ? TGroup[TGroupChildren]
    : TGroupChildren extends (group: any) => infer R
      ? R
      : never
```
