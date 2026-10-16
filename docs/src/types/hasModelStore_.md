```ts
/**
 * Whether a value is a `useModel` instance. VfForm checks `modelValue` with it
 * to adopt the instance's store directly instead of cloning the data.
 *
 * @param value The value to check.
 */
function hasModelStore(value: any): value is ModelInstance
```
