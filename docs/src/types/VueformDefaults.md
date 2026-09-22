```ts
/**
 * The merged component defaults of an instance: prop values keyed by component
 * name, layered from the config's `*`, `*element`, and per-component
 * `defaults`.
 */
type VueformDefaults = Record<ComponentNames, Record<string, any>>
```
