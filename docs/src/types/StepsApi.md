```ts
/**
 * Factory API produced by the steps blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type StepsApi<TProps extends StepsProps = StepsProps> = ReturnType<
  typeof blueprint<TProps>
>
```
