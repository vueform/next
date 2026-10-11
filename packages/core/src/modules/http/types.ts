/**
 * Expected response body type.
 */
type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer'

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

/**
 * An interceptor that can inspect or modify the request config before the
 * request is sent. May be async.
 */
export type RequestInterceptor = (
  config: HttpRequestConfig
) => HttpRequestConfig | Promise<HttpRequestConfig>

/**
 * An interceptor that can inspect or modify the response before it is returned
 * to the caller. May be async.
 */
export type ResponseInterceptor = (
  response: HttpResponse
) => HttpResponse | Promise<HttpResponse>

/**
 * HTTP request method.
 */
export type RequestMethod =
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

/**
 * Content encoding type for the request body.
 */
export type RequestType = 'json' | 'form' | 'multipart' | 'text' | 'urlencoded'

/**
 * The reason category for an HTTP error.
 */
export type HttpErrorReason =
  | 'timeout'
  | 'network'
  | 'abort'
  | 'http'
  | 'blocked'
  | 'ssr'
  | 'unknown'

/**
 * Global configuration options for the http module (`config.$http`).
 */
export interface HttpModuleOptions {
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

/**
 * Per-request configuration passed to the HTTP adapter.
 */
export interface HttpRequestConfig {
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

/**
 * Normalized HTTP response returned by all adapters.
 */
export interface HttpResponse<T = any> {
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

/**
 * An HTTP adapter function that performs the actual network request.
 */
export type HttpAdapter = <T = any>(
  config: HttpRequestConfig
) => Promise<HttpResponse<T>>

/**
 * The client surface shared by the http module and its instances: the full
 * request method plus the verb shorthands.
 */
export interface HttpClient {
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

/**
 * The http module: the client surface with the app's defaults and
 * config-declared interceptors, plus the factory producing consumer instances.
 */
export interface HttpModule extends HttpClient {
  /**
   * Creates an instance over this module — what `useHttp()` returns.
   */
  make: () => HttpInstance
}

/**
 * A consumer instance over the shared http module, produced by `make()` and
 * returned by `useHttp()`. Requests made through it run the instance's own
 * interceptors on top of the config-declared ones; interceptors registered here
 * affect only this instance's calls and are released with it. App-wide
 * interceptors are config-declared (`$http.onRequest` / `onResponse`).
 */
export interface HttpInstance extends HttpClient {
  /**
   * Registers a request interceptor for this instance, run on its requests
   * before the config-declared interceptors.
   *
   * @param fn The interceptor function.
   */
  onRequest: (fn: RequestInterceptor) => void

  /**
   * Registers a response interceptor for this instance, run on responses to its
   * requests after the config-declared interceptors.
   *
   * @param fn The interceptor function.
   */
  onResponse: (fn: ResponseInterceptor) => void
}
