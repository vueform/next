```ts
/**
 * The public `props` shape on the context: resolved props minus type-only brand
 * keys.
 */
type ContextProps<TProps> = {
  [K in keyof TProps as K extends symbol ? never : K]: TProps[K]
}
```
