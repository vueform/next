```ts
/**
 * Result returned when form submission fails due to a network or server error.
 */
interface SubmitFail {
  /**
   * The result type discriminator, always 'fail'.
   */
  type: 'fail'

  /**
   * The category of the failure (e.g. network error, timeout, abort, an origin
   * blocked by `$security.allowOrigins`, or an SSR-time request).
   */
  reason:
    | 'network'
    | 'timeout'
    | 'http'
    | 'abort'
    | 'blocked'
    | 'ssr'
    | 'unknown'

  /**
   * The HTTP status code, or null if no response was received.
   */
  status: number | null

  /**
   * A human-readable error message describing the failure.
   */
  message: string

  /**
   * The response data if available, or null.
   */
  data: any | null

  /**
   * The HTTP response object if available, or null.
   */
  response: HttpResponse | null

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}
```
