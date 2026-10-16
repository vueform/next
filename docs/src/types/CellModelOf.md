```ts
/**
 * The auto-mode cell model for a single object col: its custom element schema
 * resolved through the registry, or `any` when absent (the default cell input
 * comes from runtime config and is not statically knowable).
 */
type CellModelOf<Col, SchemaKey> = SchemaKey extends keyof Col
  ? Col[SchemaKey] extends { type: string }
    ? ElementToModel<Col[SchemaKey]>
    : any
  : any
```
