```ts
/**
 * Factory API produced by the file-upload blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type FileUploadApi<
  TProps extends FileUploadProps<string> = FileUploadProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>
```
