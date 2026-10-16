```ts
/**
 * Lazy `toRef` proxy over resolved props, used by `propRefs` and as the second
 * argument to `useClasses` factories.
 */
type PropRefsOf<TProps> = { [K in keyof TProps]-?: Ref<TProps[K]> }
```
