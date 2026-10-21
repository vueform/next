```ts
/**
 * Creates an empty schema index. Used by forms without an attached `useModel`
 * instance: the index starts blank and mounted registration fills it, so the
 * schema walk is never paid for plain forms.
 */
function makeEmptyIndex(): SchemaIndex
```
