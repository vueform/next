```ts
/**
 * Plain props type for the select-button element blueprint — the widest
 * instantiation of `SelectButtonProps`. Use this whenever "the props of a
 * select-button" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `SelectButtonApi` type parameters.
 */
type LooseSelectButtonProps = SelectButtonProps<
  string,
  OptionsProp,
  OptionValueProp,
  boolean
>
```
