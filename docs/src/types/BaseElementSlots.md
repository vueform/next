```ts
/**
 * Base slots shared by all form element types. Threads `TContext` through to
 * `BaseComponentSlots` (including the `#template` slot).
 */
interface BaseElementSlots<
  TContext = LooseContext,
> extends BaseComponentSlots<TContext> {}
```
