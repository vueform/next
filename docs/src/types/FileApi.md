```ts
/**
 * Factory API produced by the file blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
type FileApi<TProps extends FileProps<string> = FileProps<string>> = ModelApi<
  ReturnType<typeof blueprint>,
  TProps
>
```
