```ts
/**
 * Factory API produced by the checkbox blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type CheckboxApi<TProps extends CheckboxProps<string> = CheckboxProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>
```
