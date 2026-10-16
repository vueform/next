```ts
/**
 * Factory API produced by the languages blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type LanguagesApi<TProps extends LanguagesProps = LanguagesProps> = ReturnType<
  typeof blueprint<TProps>
>
```
