```ts
/**
 * Converts a form schema into its corresponding model (data) type, mapping each
 * element to its value type.
 *
 * Accepts both the loose `FormSchema` union and narrow `const` schemas returned
 * by `defineSchema` (which are not always assignable to `FormSchema` due to
 * readonly/`as const` literals).
 */
type SchemaToModel<T> = [FormSchema] extends [T]
  ? Record<string, any>
  : string extends keyof T
    ? Record<string, any>
    : [T] extends [ArraySchemaType]
      ? ObjectSchemaToModel<ToObjectSchema<T>>
      : ObjectSchemaToModel<T>
```
