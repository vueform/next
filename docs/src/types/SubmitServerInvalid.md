```ts
/**
 * Result returned when the server responds with a 422 validation error.
 */
interface SubmitServerInvalid {
  /**
   * The result type discriminator, always 'invalid'.
   */
  type: 'invalid'

  /**
   * The error source, always 'server' for 422 validation responses.
   */
  source: 'server'

  /**
   * Validation errors keyed by element path, transformed via
   * `transformServerInvalid`.
   */
  errors: Record<string, string[]>

  /**
   * Structured issues synthesized from `errors` (`rule: 'server'`), mirroring
   * the client-side `issues` shape.
   */
  issues: Issue[]

  /**
   * The raw response data from the server.
   */
  data: any

  /**
   * The full HTTP response object.
   */
  response: HttpResponse

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}
```
