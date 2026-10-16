```ts
/**
 * Factory API produced by the form blueprint's `blueprint` function, optionally
 * parameterized by concrete props (e.g. `FormApi<VfFormProps<typeof schema>>`).
 * Prefer this over `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
type FormApi<
  // `any` in the schema slot: `MaybeRef<TSchema>` is invariant through `Ref`,
  // so a `FormSchema`-typed constraint would reject every concrete schema.
  TProps extends FormProps<any, any, any, any, any> = FormProps,
> = FormApiBase & FormSchemaApi<FormPropsSchema<TProps>>
```
