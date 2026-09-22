```ts
/**
 * Events emitted by the VfForm component, parameterized by the schema type so
 * event handlers (e.g. `@submit`) receive the schema-narrowed context — same
 * pattern as element emits. Plain usage (`VfFormEmits`) keeps the context
 * wide.
 */
interface VfFormEmits<TSchema = FormSchema> extends FormEmits<
  VfFormContext<VfFormProps<TSchema>>
> {}
```
