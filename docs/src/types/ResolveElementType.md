```ts
/**
 * Resolves the element type string from props or factory result. The narrowing
 * conditional is kept inside the `type` field instead of wrapping the whole
 * object, so the surrounding API type stays a concrete intersection and remains
 * inspectable even when instantiated with a still-generic `Props` (e.g. when a
 * blueprint is composed across a package boundary through its built `.d.ts`).
 */
type ResolveElementType<Result, Props> = Omit<Result, 'type'> & {
  type: Ref<ResolveElementTypeValue<Result, Props>>
}
```
