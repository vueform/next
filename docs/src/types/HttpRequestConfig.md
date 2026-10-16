```ts
/**
 * Per-request configuration passed to the HTTP adapter.
 */
interface HttpRequestConfig {
  /**
   * The request URL (absolute or relative to `baseURL`).
   */
  url: string

  /**
   * HTTP method for this request.
   */
  method?: RequestMethod

  /**
   * Request body data.
   */
  data?: any

  /**
   * URL query parameters appended to the request URL.
   */
  params?: Record<string, string | number | boolean | undefined | null>

  /**
   * Additional headers for this request (merged with defaults).
   */
  headers?: Record<string, string>

  /**
   * Timeout in milliseconds for this request.
   */
  timeout?: number

  /**
   * An `AbortSignal` to cancel the request.
   */
  signal?: AbortSignal

  /**
   * Base URL prepended to the request URL when it is relative.
   */
  baseURL?: string

  /**
   * Body encoding type for this request.
   */
  requestType?: RequestType

  /**
   * Expected response body type for this request.
   */
  responseType?: ResponseType

  /**
   * Whether to include credentials (cookies) in cross-origin requests.
   */
  withCredentials?: boolean

  /**
   * Whether to convert `File`/`Blob` values to base64 in the request body.
   */
  base64?: boolean
}
```
