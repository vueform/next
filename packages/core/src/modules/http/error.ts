import type { HttpErrorReason, HttpRequestConfig, HttpResponse } from './types'

const REDACTED_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
])

/**
 * Copies a request config with credential-bearing headers replaced by
 * `'[redacted]'`. `HttpError`s surface on public form results (`fail` handlers,
 * `result.response`), and an app-level error reporter serializing one must not
 * ship the tokens a request interceptor attached.
 *
 * @param config The request config that triggered the error.
 */
function redactConfig(config: HttpRequestConfig): HttpRequestConfig {
  if (!config?.headers) return config

  let redacted: Record<string, string> | undefined

  for (const key of Object.keys(config.headers)) {
    if (REDACTED_HEADERS.has(key.toLowerCase())) {
      redacted ??= { ...config.headers }
      redacted[key] = '[redacted]'
    }
  }

  return redacted ? { ...config, headers: redacted } : config
}

/**
 * Error class for HTTP failures, carrying the request config, response data,
 * status, and error reason.
 */
export class HttpError extends Error {
  /**
   * HTTP status code from the response, if available.
   */
  status?: number

  /**
   * Parsed response body data, if available.
   */
  data?: any

  /**
   * The request config that triggered the error.
   */
  config: HttpRequestConfig

  /**
   * The category of failure (e.g. `'timeout'`, `'network'`, `'http'`).
   */
  reason: HttpErrorReason

  /**
   * The full HTTP response object, if the server responded.
   */
  response?: HttpResponse

  /**
   * @param message The error message.
   * @param config The request config that triggered the error.
   * @param reason The category of failure.
   * @param response The full HTTP response, if the server responded.
   */
  constructor(
    message: string,
    config: HttpRequestConfig,
    reason: HttpErrorReason = 'unknown',
    response?: HttpResponse
  ) {
    super(message)
    this.name = 'HttpError'
    this.config = redactConfig(config)
    this.reason = reason
    this.status = response?.status
    this.data = response?.data
    this.response = response
  }
}
