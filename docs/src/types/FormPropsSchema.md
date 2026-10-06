```ts
/**
 * The schema type carried by a form props type's `schema` prop (`MaybeRef`
 * unwrapped), falling back to the wide `FormSchema`.
 */
type FormPropsSchema<TProps> = TProps extends {
  schema?: MaybeRef<(infer S) | undefined>
}
  ? [S] extends [never]
    ? FormSchema
    : S
  : FormSchema
```
