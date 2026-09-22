```ts
/**
 * Plain props type for the checkbox-group element blueprint — the widest
 * instantiation of `CheckboxGroupProps`. Use this whenever "the props of a
 * checkbox-group" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `CheckboxGroupApi` type parameters.
 */
type LooseCheckboxGroupProps = CheckboxGroupProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp
>
```
