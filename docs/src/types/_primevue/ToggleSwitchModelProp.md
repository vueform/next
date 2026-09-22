```ts
/**
 * Model / default prop type for toggle-switch — `NoInfer` so `modelValue` does
 * not compete with `trueValue` / `falseValue` when inferring generics.
 */
type ToggleSwitchModelProp<TTrueValue, TFalseValue> = NoInfer<
  ToggleSwitchModelOf<TTrueValue, TFalseValue>
>
```
