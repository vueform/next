```ts
/**
 * An HTTP method that accepts a URL and optional config overrides (no body).
 */
type HttpMethodWithoutData = <T = any>(
  url: string,
  c?: Partial<HttpRequestConfig>
) => Promise<HttpResponse<T>>
```
