```ts
/**
 * Resolves the return type for `get()`. When the path contains a `@` separator
 * the portion before it identifies the element and the portion after it is
 * resolved as a (possibly nested) property on the element context. Without `@`
 * the element's model value type is returned.
 */
type GetResult<
  T,
  P extends string,
> = P extends `${infer ElPath}@${infer PropPath}`
  ? DeepPropAccess<ElementByPath<T, ElPath>, PropPath>
  : ModelByPath<T, P>
```
