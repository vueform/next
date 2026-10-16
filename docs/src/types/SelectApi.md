```ts
/**
 * Factory API produced by the select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `SelectApi<VfSelectProps<typeof items, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
type SelectApi<TProps extends LooseSelectProps = LooseSelectProps> =
  ItemsModelApi<ReturnType<typeof blueprint>, TProps>
```
