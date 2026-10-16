```ts
/**
 * Marks a context as fully assembled: effects that read members before the
 * blueprint assigned them re-run. Called by `useBlueprint` after the API has
 * been put in place.
 *
 * @param context The component context (proxy or raw).
 */
function markContextReady(context: any): void
```
