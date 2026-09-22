```ts
/**
 * Resolves event helpers: emit maps (`SelectEmits`) are wrapped with
 * `DefineEvents`; already-built `defineEvents()` returns (with `fire`) pass
 * through unchanged (e.g. from `useBlueprint`).
 */
type EventsOf<T extends Record<string, any>> = T extends {
  fire: (...args: any) => any
}
  ? T
  : DefineEvents<T>
```
