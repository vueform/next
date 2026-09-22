```ts
/**
 * The accepted shapes of `useForm`'s model argument: a `useModel` instance
 * (adopted by the form), a ref (two-way synced), a reactive object (keys synced
 * back on update), or a plain object (initial value).
 */
type UseFormModelArg<M extends Record<string, any>> =
  | ModelInstance<any>
  | Ref<DeepPartial<M> | Record<string, any> | undefined>
  | (DeepPartial<M> & Record<string, any>)
```
