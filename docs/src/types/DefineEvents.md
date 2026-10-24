```ts
/**
 * The return type of `defineEvents`, providing fire, on and off methods.
 */
type DefineEvents<T extends Record<string, any>> = ReturnType<
  typeof defineEvents<T>
>
```
