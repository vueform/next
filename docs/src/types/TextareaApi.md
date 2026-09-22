```ts
/**
 * Factory API produced by the textarea blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type TextareaApi<TProps extends TextareaProps<string> = TextareaProps<string>> =
  // The value is always the textarea scalar — the model itself when not
  // translating, the active language's entry when translating.
  TranslatableModelApi<
    ReturnType<typeof blueprint>,
    TProps,
    string | number | null
  >
```
