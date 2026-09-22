```ts
/**
 * Bound for the `TGroupChildren` generic of options-based elements: a group
 * key, a function mapping a group to a children array, or `undefined` when
 * unset.
 *
 * Intentionally simple so component `generic="…"` declarations stay readable.
 * Whether a key is actually valid for the current `options` shape is enforced
 * by the `optionGroupChildren` prop type itself (via
 * `AllowedOptionGroupChildren`), not by this bound.
 */
type OptionGroupChildrenProp = string | ((group: any) => any[]) | undefined
```
