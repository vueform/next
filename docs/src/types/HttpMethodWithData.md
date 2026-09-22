```ts
/**
 * An HTTP method that accepts a URL, optional request body, and optional config
 * overrides.
 */
type HttpMethodWithData = <T = any>(
  url: string,
  data?: any,
  c?: Partial<HttpRequestConfig>
) => Promise<HttpResponse<T>>
```
