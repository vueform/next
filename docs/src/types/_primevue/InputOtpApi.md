```ts
/**
 * Factory API produced by the input-otp blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type InputOtpApi<TProps extends InputOtpProps<string> = InputOtpProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>
```
