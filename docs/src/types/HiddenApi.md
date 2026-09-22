```ts
/**
 * Factory API produced by the hidden blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type HiddenApi<TProps extends HiddenProps<string> = HiddenProps<string>> =
  ReturnType<typeof blueprint<TProps>>
```
