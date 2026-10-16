```ts
/**
 * The return type of `defineEvents`, providing fire, on, off, onBefore, and
 * onAfter methods.
 */
type DefineEvents<T extends Record<string, any>> = ReturnType<
  typeof defineEvents<T>
>
```
