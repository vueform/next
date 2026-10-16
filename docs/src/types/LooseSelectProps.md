```ts
/**
 * Plain props type for the select element blueprint — the widest instantiation
 * of `SelectProps`. Use this whenever "the props of a select" is meant without
 * generic narrowing; it also serves as the constraint for `blueprint` /
 * `SelectApi` type parameters.
 */
type LooseSelectProps = SelectProps<
  string,
  ItemsProp,
  ItemValueProp,
  GroupChildrenProp,
  boolean
>
```
