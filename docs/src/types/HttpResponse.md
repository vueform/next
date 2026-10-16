```ts
/**
 * Normalized HTTP response returned by all adapters.
 */
interface HttpResponse<T = any> {
  /**
   * The parsed response body.
   */
  data: T

  /**
   * HTTP status code.
   */
  status: number

  /**
   * HTTP status text (e.g. `"OK"`).
   */
  statusText: string

  /**
   * Response headers as a flat key-value map.
   */
  headers: Record<string, string>

  /**
   * The request config that produced this response.
   */
  config: HttpRequestConfig
}
```
