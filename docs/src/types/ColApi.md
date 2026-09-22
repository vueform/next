```ts
/**
 * Factory API produced by the col blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
type ColApi<TProps extends ColProps = ColProps> = ReturnType<
  typeof blueprint<TProps>
>
```
