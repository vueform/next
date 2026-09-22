```ts
/**
 * The client surface shared by the http module and its instances: the full
 * request method plus the verb shorthands.
 */
interface HttpClient {
  /**
   * Sends an HTTP request using the configured adapter, applying interceptors
   * and default settings.
   *
   * @param reqConfig The request configuration.
   */
  request: <T = any>(reqConfig: HttpRequestConfig) => Promise<HttpResponse<T>>

  /**
   * Sends a GET request.
   */
  get: HttpMethodWithoutData

  /**
   * Sends a POST request.
   */
  post: HttpMethodWithData

  /**
   * Sends a PUT request.
   */
  put: HttpMethodWithData

  /**
   * Sends a PATCH request.
   */
  patch: HttpMethodWithData

  /**
   * Sends a DELETE request.
   */
  delete: HttpMethodWithoutData
}
```
