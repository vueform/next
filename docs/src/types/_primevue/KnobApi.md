```ts
/**
 * Factory API produced by the knob blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
type KnobApi<TProps extends KnobProps<string> = KnobProps<string>> = ReturnType<
  typeof blueprint<TProps>
>
```
