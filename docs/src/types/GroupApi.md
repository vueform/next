```ts
/**
 * Factory API produced by the group blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g. `GroupApi<EntryProps>` with
 * a schema-narrowed `modelValue`). Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites (Expose / Context layers, extensions).
 */
type GroupApi<TProps extends GroupProps<string> = GroupProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>
```
