```ts
/**
 * Factory API produced by the element blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type LayoutApi<TProps extends LayoutProps = LayoutProps> = ReturnType<
  typeof blueprint<TProps>
>
```
