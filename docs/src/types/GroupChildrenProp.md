```ts
/**
 * Bound for the `TGroupChildren` generic of items-based elements: a group key,
 * a function mapping a group to its children, or `undefined` when unset.
 *
 * Intentionally simple so component `generic="…"` declarations stay readable.
 * Whether a key is actually valid for the current `items` shape is enforced by
 * the `groupChildren` prop type itself (via `AllowedGroupChildren`), not by
 * this bound.
 */
type GroupChildrenProp =
  | string
  | ((group: any) => any[] | Record<string, any>)
  | undefined
```
