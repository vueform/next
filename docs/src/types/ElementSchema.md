```ts
/**
 * An element schema definition where the `name` property is optional (inferred
 * from the object key).
 */
type ElementSchema = MakeOptional<NamedElementSchema, 'name'>
```
