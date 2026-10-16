```ts
/**
 * Factory API produced by the content blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type ContentApi<TProps extends ContentProps<string> = ContentProps<string>> =
  ReturnType<typeof blueprint<TProps>>
```
