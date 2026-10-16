```ts
/**
 * Selection-keys model for a tree of nodes with `key` / `children`.
 *
 * - `selectionMode: 'checkbox'` → `{ [key]?: { checked; partialChecked } }`
 * - otherwise (`single` / `multiple` / unset) → `{ [key]?: true }`
 *
 * Empty selection is `{}` (not `null`). Endpoint / unconstrained items fall
 * back to `TModel`.
 */
type TreeKeysModel<TOptions, TSelectionMode = undefined, TModel = any> =
  IsDefaultItems<TOptions> extends true
    ? TModel
    : UnwrappedItems<TOptions> extends string
      ? TModel
      : TreeKeysOfNodes<UnwrappedItems<TOptions>> extends infer Keys
        ? [Keys] extends [never]
          ? TModel
          : // Non-distributive check — keep `Partial<Record<K1|K2, …>>` instead of
            // `Partial<Record<K1, …>> | Partial<Record<K2, …>>`.
            [Keys] extends [string | number]
            ? TSelectionMode extends 'checkbox'
              ? Partial<
                  Record<Keys & (string | number), TreeCheckboxSelectionMeta>
                >
              : Partial<Record<Keys & (string | number), true>>
            : TModel
        : TModel
```
