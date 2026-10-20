```ts
/**
 * The default `transformServerInvalid`: a 422 body's `errors` key, or the body
 * itself.
 *
 * @param data The raw error response data.
 */
function defaultTransformServerInvalid(data: Record<string, any> | null): any
```
