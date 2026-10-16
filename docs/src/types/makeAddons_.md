```ts
/**
 * Provides resolved before/after addon arrays for input elements. Functions are
 * called with the element context and arrays are split so each item is passed
 * individually to `VfAddon`.
 *
 * @param options Factory options containing the element's addon props.
 */
const makeAddons: (
  config?: unknown
) => (options: MakeAddonsOptions) => {
  addonable: boolean
  addonsBefore: ComputedRef<AddonItem[]>
  addonsAfter: ComputedRef<AddonItem[]>
}
```
