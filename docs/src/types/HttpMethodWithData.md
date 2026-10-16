```ts
/**
 * An HTTP method that accepts a URL, optional request body, and optional config
 * overrides.
 */
type HttpMethodWithData =
  /**
   * Sends a request with a body to the given URL.
   *
   * @param url The request URL.
   * @param data The request body.
   * @param c The request config overrides merged into the defaults.
   */
  <T = any>(
    url: string,
    data?: any,
    c?: Partial<HttpRequestConfig>
  ) => Promise<HttpResponse<T>>
```
