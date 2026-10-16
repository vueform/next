```ts
/**
 * Factory API produced by the editor blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type EditorApi<TProps extends EditorProps<string> = EditorProps<string>> =
  TranslatableModelApi<ReturnType<typeof blueprint>, TProps>
```
