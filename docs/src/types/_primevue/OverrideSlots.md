```ts
/**
 * Replaces selected keys on a slot map while keeping the remaining forwarded
 * slots intact.
 */
type OverrideSlots<TBase, TOverrides> = Omit<TBase, keyof TOverrides> &
  TOverrides
```
