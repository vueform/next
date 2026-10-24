```ts
/**
 * Returns the public context of the nearest Vueform component — the same object
 * it passes to the `#template` slot and the one event handlers receive as
 * `context$`.
 *
 * @param name The component name used for type inference.
 */
function useContext<T extends ComponentNames>(name: T): ContextOf<T>
```
