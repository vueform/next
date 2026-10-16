```ts
/**
 * Factory API produced by the row blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
type RowApi<TProps extends RowProps = RowProps> = ReturnType<
  typeof blueprint<TProps>
>
```
