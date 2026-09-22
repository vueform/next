```ts
/**
 * Factory API produced by the matrix blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g. `MatrixApi<EntryProps>` with
 * a rows/cols/mode-narrowed `modelValue`). Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites (Expose / Context layers, extensions).
 */
type MatrixApi<TProps extends MatrixProps<string> = MatrixProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>
```
