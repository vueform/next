```ts
/**
 * Assembled blueprint return. Factory members live under `api` for internal
 * destructuring; `context` is the flat public shape used by `defineExpose` and
 * the `#template` slot.
 */
/**
 * The members `useBlueprint` builds for a `makeForwards` declaration and
 * assigns onto the api (see `buildForwards`).
 */
type ForwardsApi = {
  /**
   * Component attrs with forwarded event listeners routed through the Vueform
   * event system.
   */
  forwardProps: ComputedRef<Record<string, any>>

  /**
   * Outlets filtered to only include those designated for the underlying
   * adapter component.
   */
  forwardSlots: ComputedRef<Record<string, any>>
}
```
