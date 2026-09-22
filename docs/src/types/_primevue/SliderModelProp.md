```ts
/**
 * Model / default prop type for slider — `NoInfer` so `modelValue` does not
 * compete with `range` when inferring generics.
 */
type SliderModelProp<TRange extends boolean = boolean> = NoInfer<
  SliderModelOf<TRange>
>
```
