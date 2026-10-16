```ts
/**
 * Factory API produced by the cascade-select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `CascadeSelectApi<VfCascadeSelectProps<typeof options, 'id'>>`). Prefer this
 * over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 */
type CascadeSelectApi<
  TProps extends LooseCascadeSelectProps = LooseCascadeSelectProps,
> = OptionsModelApi<ReturnType<typeof blueprint>, TProps>
```
