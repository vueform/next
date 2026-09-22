```ts
/**
 * Factory API produced by the radio-button blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type RadioButtonApi<
  TProps extends RadioButtonProps<string> = RadioButtonProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>
```
