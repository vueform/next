```ts
/**
 * Makes an object type accept arbitrary extra string keys.
 */
type OpenObject<T> =
  T extends Record<string, any> ? T & Record<string & {}, any> : T
```
