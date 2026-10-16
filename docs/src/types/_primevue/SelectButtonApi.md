```ts
/**
 * Factory API produced by the select-button blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `SelectButtonApi<VfSelectButtonProps<typeof options, 'id'>>`). Prefer this
 * over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 */
type SelectButtonApi<
  TProps extends LooseSelectButtonProps = LooseSelectButtonProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>
```
