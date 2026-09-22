```ts
/**
 * Model / default prop type for radio-button — `NoInfer` so `modelValue` does
 * not compete with `value` when inferring generics.
 */
type RadioButtonModelProp<TRadioValue> = NoInfer<
  RadioButtonModelOf<TRadioValue>
>
```
