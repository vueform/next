```ts
/**
 * Factory API produced by the input-mask blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type InputMaskApi<
  TProps extends InputMaskProps<string> = InputMaskProps<string>,
> = TranslatableModelApi<ReturnType<typeof blueprint>, TProps>
```
