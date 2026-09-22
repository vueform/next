```ts
/**
 * Factory API produced by the checkbox-group blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `CheckboxGroupApi<VfCheckboxGroupProps<typeof options, 'id'>>`). Prefer this
 * over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 */
type CheckboxGroupApi<
  TProps extends LooseCheckboxGroupProps = LooseCheckboxGroupProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>
```
