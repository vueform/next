```ts
/**
 * Factory API produced by the listbox blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `ListboxApi<VfListboxProps<typeof options, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
type ListboxApi<TProps extends LooseListboxProps = LooseListboxProps> =
  OptionsModelApi<ReturnType<typeof blueprint>, TProps>
```
