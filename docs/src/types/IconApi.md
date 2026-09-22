```ts
/**
 * Factory API produced by the icon blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
type IconApi<TProps extends IconProps = IconProps> = ReturnType<
  typeof blueprint<TProps>
>
```
