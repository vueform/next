```ts
/**
 * Model metadata function returning a container element's unified child
 * structure derived from its raw schema-entry props. Leaf elements omit it.
 *
 * @param props The element's raw schema-entry props.
 */
type ModelMetaChildren = (
  props: Record<string, any>
) => ModelChildren | undefined
```
