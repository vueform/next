```ts
/**
 * Resolves a form schema definition into a normalized array of named element
 * schemas with their component names.
 *
 * @param schema The form schema to resolve, either as an array or keyed object.
 */
function useSchema(
  schema: Ref<FormSchema | undefined>
): ComputedRef<{ props: NamedElementSchema; component: any }[]>
```
