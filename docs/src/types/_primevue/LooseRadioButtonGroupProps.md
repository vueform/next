```ts
/**
 * Plain props type for the radio-button-group element blueprint — the widest
 * instantiation of `RadioButtonGroupProps`. Use this whenever "the props of a
 * radio-button-group" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `RadioButtonGroupApi` type parameters.
 */
type LooseRadioButtonGroupProps = RadioButtonGroupProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp
>
```
