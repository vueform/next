```ts
/**
 * Return type for the useOutlets composable.
 */
type UseOutletsReturn = {
  /**
   * The merged and normalized outlets map. Includes a resolved `template` entry
   * from the template prop or `slots.template`.
   */
  outlets: ComputedRef<Record<string, any>>
}
```
