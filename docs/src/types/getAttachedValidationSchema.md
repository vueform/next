```ts
/**
 * Returns the Standard Schema attached to a schema (or schema ref) via
 * `defineSchema` / `defineComputedSchema`'s second argument, if any. For refs
 * the ref itself is tried first, then the unwrapped schema object. Lookups go
 * through `toRaw` since schemas passed as props arrive as reactive proxies
 * while the WeakMap is keyed by the original object.
 *
 * @param schema The schema object or ref to look up.
 */
function getAttachedValidationSchema(
  schema: unknown
): StandardSchemaV1 | undefined
```
