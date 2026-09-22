```ts
/**
 * A model value that supports multilingual content as a locale-keyed object, or
 * a plain scalar. Record values include `undefined` so partially provided
 * locale objects (optional keys) stay assignable — missing languages are
 * initialized by the element at runtime.
 */
type TranslatableModel =
  Record<string, string | number | null | undefined> | string | number | null
```
