```ts
/**
 * The field's current-value type, read from the `nullValue` prop — which types
 * one value in both modes (the model when not translating, the per-language
 * entry when translating), so no model-shape dissection is needed.
 */
type FieldValueOf<TProps> = 'nullValue' extends keyof TProps
  ? FieldNullValue<Exclude<TProps['nullValue'], undefined>>
  : any
```
