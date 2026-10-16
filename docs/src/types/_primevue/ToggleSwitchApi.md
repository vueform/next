```ts
/**
 * Factory API produced by the toggle-switch blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type ToggleSwitchApi<
  TProps extends ToggleSwitchProps<string> = ToggleSwitchProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>
```
