```ts
/**
 * Result returned when form submission is rejected due to client-side
 * validation errors.
 */
interface SubmitClientInvalid {
  /**
   * The result type discriminator, always 'invalid'.
   */
  type: 'invalid'

  /**
   * The error source, always 'client' for client-side validation failures.
   */
  source: 'client'

  /**
   * Validation errors keyed by element path.
   */
  errors: Record<string, string[]>

  /**
   * Structured validation issues (`{ path, rule, message }`) — the same
   * projection as `form$.issues` at the time of submission.
   */
  issues: Issue[]

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}
```
