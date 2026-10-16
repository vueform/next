```ts
/**
 * The synthetic prototype entry a non-flat list wraps its rows in at runtime
 * (see the list blueprint's `prototype`).
 */
type ListRowEntry<S> = { type: 'group'; nested: true; schema: S }
```
