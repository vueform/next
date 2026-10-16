```ts
/**
 * Factory API produced by the button blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type ButtonApi<TProps extends ButtonProps<string> = ButtonProps<string>> =
  ReturnType<typeof blueprint<TProps>>
```
