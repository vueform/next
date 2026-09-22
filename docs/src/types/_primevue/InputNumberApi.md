```ts
/**
 * Factory API produced by the input-number blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type InputNumberApi<
  TProps extends InputNumberProps<string> = InputNumberProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>
```
