```ts
/**
 * Returns the underlying model store of a `useModel` instance.
 *
 * Module-internal — consumed by `makeRootModel` for form attachment, never
 * exposed outside the module.
 *
 * @param instance The model instance to unwrap.
 */
function getModelStore(instance: ModelInstance<any>): ModelStore
```
