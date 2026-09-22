```ts
/**
 * Plain props type for the radios element blueprint — the widest instantiation
 * of `RadiosProps`. Use this whenever "the props of a radios" is meant without
 * generic narrowing; it also serves as the constraint for `blueprint` /
 * `RadiosApi` type parameters.
 */
type LooseRadiosProps = RadiosProps<
  string,
  ItemsProp,
  ItemValueProp,
  GroupChildrenProp
>
```
