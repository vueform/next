```ts
/**
 * Plain props type for the tree-select element blueprint — the widest
 * instantiation of `TreeSelectProps`. Use this whenever "the props of a
 * tree-select" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `TreeSelectApi` type parameters.
 */
type LooseTreeSelectProps = TreeSelectProps<
  string,
  TreeOptionsProp,
  TreeSelectionModeProp
>
```
