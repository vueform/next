```ts
/**
 * Returns a reactive ref that resolves a prop value by falling back from the
 * element context to the form context.
 *
 * @param prop The prop name to look up on the element and form contexts.
 */
function useFallbackProp<T = any>(prop: string): Ref<T>
```
