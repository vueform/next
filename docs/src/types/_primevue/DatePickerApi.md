```ts
/**
 * Factory API produced by the date-picker blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `DatePickerApi<VfDatePickerProps<'multiple'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type DatePickerApi<
  TProps extends DatePickerProps<string> = DatePickerProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>
```
