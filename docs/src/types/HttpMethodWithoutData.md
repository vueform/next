```ts
/**
 * An HTTP method that accepts a URL and optional config overrides (no body).
 */
type HttpMethodWithoutData =
  /**
   * Sends a request without a body to the given URL.
   *
   * @param url The request URL.
   * @param c The request config overrides merged into the defaults.
   */
  <T = any>(
    url: string,
    c?: Partial<HttpRequestConfig>
  ) => Promise<HttpResponse<T>>
```
