```ts
/**
 * Every part's resolved binding bag, keyed like the component's `bindings`
 * aggregate — the building block for a component's private resolved-bags
 * alias (see `PartBindings`).
 */
type ResolvedBindings<TParts, TBindings = {}> = {
  [K in keyof TParts | keyof TBindings]: PartBindings<K, TParts, TBindings>
}
```
