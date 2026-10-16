```ts
/**
 * Factory API produced by the radios blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `RadiosApi<VfRadiosProps<typeof items, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
type RadiosApi<TProps extends LooseRadiosProps = LooseRadiosProps> =
  ItemsModelApi<ReturnType<typeof blueprint>, TProps>
```
