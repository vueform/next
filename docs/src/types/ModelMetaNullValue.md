```ts
/**
 * Model metadata function returning the element's null (empty) value derived
 * from its raw schema-entry props. Implementations must apply their own prop
 * defaults (e.g. checkbox `falseValue ?? false`).
 *
 * @param props The element's raw schema-entry props.
 */
type ModelMetaNullValue = (props: Record<string, any>) => any
```
