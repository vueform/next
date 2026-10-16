```ts
/**
 * Reads an optional prop from a registry `TEntry` payload (schema entry / props
 * object), falling back to `undefined` when the key is absent.
 *
 * Using `prop?: infer V` on a type that lacks the prop yields `unknown`, which
 * poisons generic extraction (e.g. `groupChildren: unknown`). Keyof-gating
 * keeps missing props as `undefined`, matching SFC generic defaults.
 */
type EntryPropOf<TEntry, K extends PropertyKey> = K extends keyof TEntry
  ? TEntry[K]
  : undefined
```
