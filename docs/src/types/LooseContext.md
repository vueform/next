```ts
/**
 * Marker mixed into `LooseContext` so refined event maps can find `context$`
 * slots by type (not by argument position).
 */
type LooseContext = {
  readonly [compContextBrand]?: true
} & { form$: FormContext }
```
