```ts
/**
 * HTTP request method.
 */
type RequestMethod =
  | (
      | 'GET'
      | 'HEAD'
      | 'OPTIONS'
      | 'TRACE'
      | 'PUT'
      | 'DELETE'
      | 'POST'
      | 'PATCH'
      | 'CONNECT'
    )
  | (string & {})
```
