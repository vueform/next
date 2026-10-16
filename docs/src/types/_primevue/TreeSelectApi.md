```ts
/**
 * Factory API produced by the tree-select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `TreeSelectApi<VfTreeSelectProps<typeof options, 'checkbox'>>`). Prefer this
 * over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 *
 * `makeTreeOptions` returns a fixed `TreeNode[]` `items` list (not
 * parameterized by `TOptions`), so `ModelApi` is used rather than
 * `ItemsModelApi`.
 */
type TreeSelectApi<TProps extends LooseTreeSelectProps = LooseTreeSelectProps> =
  ModelApi<ReturnType<typeof blueprint>, TProps>
```
