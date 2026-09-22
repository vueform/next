```ts
/**
 * Global configuration options for the http module (`config.$http`).
 */
interface HttpModuleOptions {
  /**
   * Default HTTP method when none is specified per request.
   */
  defaultMethod?: RequestMethod

  /**
   * Default headers sent with every request.
   */
  headers?: Record<string, string>

  /**
   * Default request timeout in milliseconds.
   */
  timeout?: number

  /**
   * Base URL prepended to relative request URLs.
   */
  baseURL?: string

  /**
   * Default body encoding type for requests.
   */
  requestType?: RequestType

  /**
   * Default expected response body type.
   */
  responseType?: ResponseType

  /**
   * Whether to include credentials (cookies) in cross-origin requests.
   */
  withCredentials?: boolean

  /**
   * Whether to automatically convert `File`/`Blob` values to base64 in JSON
   * request bodies.
   */
  base64?: boolean

  /**
   * App-wide request interceptors, run on every request — submissions,
   * autosave, and instance calls alike (after any instance-registered ones).
   */
  onRequest?: RequestInterceptor[]

  /**
   * App-wide response interceptors, run on every response (before any
   * instance-registered ones).
   */
  onResponse?: ResponseInterceptor[]

  /**
   * The HTTP adapter — `fetchHttpAdapter` (from `@vueform/core`) or a custom
   * one. Required: `request` throws when unset, so an unused Fetch
   * implementation is never bundled.
   */
  adapter?: HttpAdapter
}
```
