```ts
/**
 * Factory API produced by the grid blueprint's `blueprint` function, optionally
 * parameterized by concrete props (e.g. `GridApi<EntryProps>` with a
 * grid-schema-narrowed `modelValue`). Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites (Expose / Context layers, extensions).
 */
type GridApi<TProps extends GridProps<string> = GridProps<string>> = ModelApi<
  ReturnType<typeof blueprint>,
  TProps
>
```
