```ts
/**
 * Model / default prop type for radio — `NoInfer` so `modelValue` does not
 * compete with `radioValue` when inferring generics.
 */
type RadioModelProp<TRadioValue> = NoInfer<RadioModelOf<TRadioValue>>
```
