```ts
/**
 * Plain props type for the listbox element blueprint — the widest instantiation
 * of `ListboxProps`. Use this whenever "the props of a listbox" is meant
 * without generic narrowing; it also serves as the constraint for `blueprint` /
 * `ListboxApi` type parameters.
 */
type LooseListboxProps = ListboxProps<
  string,
  OptionsProp,
  OptionValueProp,
  OptionGroupChildrenProp,
  boolean
>
```
