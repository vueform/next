```ts
/**
 * Factory API produced by the auto-complete blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
type AutoCompleteApi<
  TProps extends LooseAutoCompleteProps = LooseAutoCompleteProps,
> = ModelApi<ReturnType<typeof blueprint>, TProps>
```
