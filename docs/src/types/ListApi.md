```ts
/**
 * Factory API produced by the list blueprint's `blueprint` function, optionally
 * parameterized by concrete props (e.g. `ListApi<EntryProps>` with a
 * schema-narrowed `modelValue`). Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites (Expose / Context layers, extensions).
 */
type ListApi<TProps extends ListProps<string> = ListProps<string>> = ModelApi<
  ReturnType<typeof blueprint>,
  TProps
>
```
