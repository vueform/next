```ts
/**
 * An element schema that can be rendered inside an addon slot. Only element
 * types whose props include `as?: 'addon'` are accepted.
 */
type AddonSchema = MakeRequired<
  { [K in AddonableElementNames]: SchemaEntryOf<K> }[AddonableElementNames],
  'type'
>
```
