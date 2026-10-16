```ts
/**
 * Factory API produced by the input-text blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type InputTextApi<
  TProps extends InputTextProps<string> = InputTextProps<string>,
> = TranslatableModelApi<ReturnType<typeof blueprint>, TProps>
```
