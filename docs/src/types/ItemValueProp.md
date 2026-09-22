```ts
/**
 * Bound for the `TItemValueKey` generic of items-based elements: a string item
 * key, or `undefined` when unset.
 *
 * Intentionally simple so component `generic="…"` declarations stay readable.
 * Whether a key is actually valid for the current `items` shape is enforced by
 * the `itemValue` prop type itself (via `AllowedItemValueKey`), not by this
 * bound.
 */
type ItemValueProp = string | undefined
```
