```ts
/**
 * Plain props type for the cascade-select element blueprint — the widest
 * instantiation of `CascadeSelectProps`. Use this whenever "the props of a
 * cascade-select" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `CascadeSelectApi` type parameters.
 */
type LooseCascadeSelectProps = CascadeSelectProps<
  string,
  OptionsProp,
  OptionValueProp,
  CascadeOptionGroupChildrenProp
>
```
