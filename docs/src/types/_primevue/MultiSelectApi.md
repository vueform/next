```ts
/**
 * Factory API produced by the multi-select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `MultiSelectApi<VfMultiSelectProps<typeof options, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
type MultiSelectApi<
  TProps extends LooseMultiSelectProps = LooseMultiSelectProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>
```
