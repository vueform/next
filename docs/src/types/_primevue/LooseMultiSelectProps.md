```ts
/**
 * Plain props type for the multi-select element blueprint — the widest
 * instantiation of `MultiSelectProps`. Use this whenever "the props of a
 * multi-select" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `MultiSelectApi` type parameters.
 */
type LooseMultiSelectProps = MultiSelectProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp
>
```
