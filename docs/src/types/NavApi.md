```ts
/**
 * Factory API produced by the nav blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
type NavApi<TProps extends NavProps = NavProps> = ReturnType<
  typeof blueprint<TProps>
>
```
