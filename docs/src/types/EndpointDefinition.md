```ts
/**
 * A string URL, request config, or function that `useEndpoint` can resolve.
 */
type EndpointDefinition =
  string | HttpRequestConfig | ((http: HttpInstance, ...args: any[]) => any)
```
