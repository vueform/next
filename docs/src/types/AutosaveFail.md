```ts
/**
 * Result passed to the `autosaveFail` event when a save fails — a request
 * error, or a response with a non-2xx status. The same shape as a submission's
 * fail result, with two differences: `reason` includes `'invalid'` (a 422 —
 * autosave has no separate server-invalid event) and never `'abort'` (an
 * aborted or superseded save settles silently).
 */
interface AutosaveFail {
  /**
   * The result type discriminator, always 'fail'.
   */
  type: 'fail'

  /**
   * The category of the failure.
   */
  reason:
    | 'network'
    | 'invalid'
    | 'timeout'
    | 'http'
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
   * The form context instance at the time of the save.
   */
  context$: any
}
```
