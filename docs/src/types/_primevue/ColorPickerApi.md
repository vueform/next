```ts
/**
 * Factory API produced by the color-picker blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type ColorPickerApi<
  TProps extends ColorPickerProps<string> = ColorPickerProps<string>,
> = ReturnType<typeof blueprint<TProps>>
```
