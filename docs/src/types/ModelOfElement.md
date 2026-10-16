```ts
/**
 * Resolves the model type of a leaf schema entry from its registry entry
 * instantiated with the entry itself (so `items` / `translate` / etc. narrow
 * it), falling back to `any`.
 */
type ModelOfElement<
  N extends ElementNames,
  El,
> = ElementRegistry<El>[N]['props'] extends { modelValue?: infer M }
  ? Exclude<M, undefined>
  : any
```
