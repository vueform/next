```ts
/**
 * Model / default prop type for checkbox — `NoInfer` so `modelValue` does not
 * compete with `trueValue` / `falseValue` when inferring generics.
 */
type CheckboxModelProp<TTrueValue, TFalseValue> = NoInfer<
  CheckboxModelOf<TTrueValue, TFalseValue>
>
```
