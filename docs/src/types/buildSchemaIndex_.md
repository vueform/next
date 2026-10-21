```ts
/**
 * Walks a schema into its index: the node tree describing every data-carrying
 * element, plus the default model and null-value tree.
 */
function buildSchemaIndex(
  schema: FormSchema | undefined,
  options: BuildModelOptions
): SchemaIndex
```
