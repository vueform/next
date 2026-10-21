```ts
/**
 * Reconciles an existing index against a changed schema in place. Every
 * identity (index, surviving nodes) is preserved so attaching forms and
 * expression state carry over; the returned diff drives data seeding and
 * engine rebuilds.
 */
function reconcileSchemaIndex(
  index: SchemaIndex,
  schema: FormSchema | undefined,
  options: BuildModelOptions
): SchemaIndexDiff
```
