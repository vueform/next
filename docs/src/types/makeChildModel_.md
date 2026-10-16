```ts
/**
 * Creates the reactive model for a child element by reading from its parent
 * container's model and keeping it in sync with the element's `v-model`,
 * mirroring the lifecycle interface of `makeRootModel`.
 *
 * @param options Child model configuration object.
 */
function makeChildModel(options: MakeChildModelOptions): {
  model: ComputedRef<any>
  lastModel: Ref<any, any>
  initialModel: Ref<any, any>
  init: () => void
  destroy: () => void
}
```
