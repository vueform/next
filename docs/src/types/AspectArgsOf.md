```ts
/**
 * A member's call parameters, `never` for non-function members.
 */
type AspectArgsOf<T> = T extends (...args: infer A) => any ? A : never
```
