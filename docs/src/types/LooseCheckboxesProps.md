```ts
/**
 * Plain props type for the checkboxes element blueprint — the widest
 * instantiation of `CheckboxesProps`. Use this whenever "the props of a
 * checkboxes" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `CheckboxesApi` type parameters.
 */
type LooseCheckboxesProps = CheckboxesProps<
  string,
  ItemsProp,
  ItemValueProp,
  GroupChildrenProp
>
```
