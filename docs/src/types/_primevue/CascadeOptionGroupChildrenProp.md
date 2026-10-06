```ts
/**
 * Bound for the `TGroupChildren` generic of cascade-select elements: a group
 * key, a nested path array, a function mapping a group to a children array, or
 * `undefined` when unset.
 *
 * The cascade counterpart of `OptionGroupChildrenProp` — intentionally simple
 * so component `generic="…"` declarations stay readable. Whether a key or path
 * is actually valid for the current `options` shape is enforced by the
 * `optionGroupChildren` prop type itself (via
 * `AllowedCascadeOptionGroupChildren`), not by this bound.
 */
type CascadeOptionGroupChildrenProp =
  | string
  | string[]
  | ((group: any) => any[])
  | undefined
```
