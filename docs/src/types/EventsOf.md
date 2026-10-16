```ts
/**
 * Resolves event helpers: emit maps are wrapped with `DefineEvents`;
 * already-built `defineEvents()` returns pass through unchanged.
 */
type EventsOf<T extends Record<string, any>> = T extends {
  fire: (...args: any) => any
}
  ? T
  : DefineEvents<T>
```
