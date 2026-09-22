```ts
/**
 * Factory API produced by the slider blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type SliderApi<TProps extends SliderProps<string> = SliderProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>
```
