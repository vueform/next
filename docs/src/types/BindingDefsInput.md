```ts
/**
 * What the `useBindings` registrar accepts: part-keyed definition objects.
 * Typed `Record<string, any>` at the boundary so interface-typed pattern
 * results (which carry no index signature) are accepted; the per-key entry
 * contracts live on the component's `VfXBindings` interface and the pattern
 * interfaces.
 */
type BindingDefsInput = Record<string, any>
```
