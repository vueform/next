```ts
/**
 * Factory API produced by the rating blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type RatingApi<TProps extends RatingProps<string> = RatingProps<string>> =
  ReturnType<typeof blueprint<TProps>>
```
