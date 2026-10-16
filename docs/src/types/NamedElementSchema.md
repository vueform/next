```ts
/**
 * An element schema definition with a required `type` property. This is the
 * autocomplete surface for schema entries — a union over every registered
 * element, discriminated by the `type` literal.
 */
type NamedElementSchema = MakeRequired<
  { [K in ElementNames]: SchemaEntryOf<K> }[ElementNames],
  'type'
>
```
