```ts
/**
 * Factory API produced by the text blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
type TextApi<TProps extends TextProps<string> = TextProps<string>> =
  // The value is always the text scalar — the model itself when not
  // translating, the active language's entry when translating.
  TranslatableModelApi<
    ReturnType<typeof blueprint>,
    TProps,
    string | number | null
  >
```
