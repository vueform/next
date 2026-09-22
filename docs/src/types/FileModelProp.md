```ts
/**
 * Model / default prop type for file elements — `NoInfer` so `modelValue` does
 * not compete with `multiple` when inferring generics.
 */
type FileModelProp<TMultiple extends boolean = boolean> = NoInfer<
  FileModelOf<TMultiple>
>
```
