```ts
/**
 * Resolves the element type string from props or factory result.
 */
type ResolveElementType<Result, Props> = Omit<Result, 'type'> & {
  type: Ref<ResolveElementTypeValue<Result, Props>>
}
```
