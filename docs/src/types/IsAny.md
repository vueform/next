```ts
/**
 * `true` if `T` is `any`, otherwise `false`.
 */
type IsAny<T> = 0 extends 1 & T ? true : false
```
