```ts
/**
 * Factory API produced by the radio-button-group blueprint's `blueprint`
 * function, optionally parameterized by concrete props (e.g.
 * `RadioButtonGroupApi<VfRadioButtonGroupProps<typeof options, 'id'>>`). Prefer
 * this over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 */
type RadioButtonGroupApi<
  TProps extends LooseRadioButtonGroupProps = LooseRadioButtonGroupProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>
```
