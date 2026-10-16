```ts
/**
 * Returns a typed helper function for declaring component prop defaults
 * inferred from the given props type.
 */
function defineDefaults<TProps>(): <
  const TDefaults extends InferDefaults<TProps>,
>(
  defaults: TDefaults
) => TDefaults
```
