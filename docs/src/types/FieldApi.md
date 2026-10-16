```ts
/**
 * Factory API produced by the field blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type FieldApi<TProps extends FieldProps<string> = FieldProps<string>> =
  TranslatableModelApi<
    ReturnType<typeof blueprint>,
    TProps,
    FieldValueOf<TProps>
  >
```
