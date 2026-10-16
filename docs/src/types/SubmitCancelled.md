```ts
/**
 * Result returned when form submission is cancelled before sending a request.
 */
interface SubmitCancelled {
  /**
   * The result type discriminator, always 'cancelled'.
   */
  type: 'cancelled'

  /**
   * The reason the submission was cancelled (e.g. form was invalid, disabled,
   * or already submitting).
   */
  reason: 'loading' | 'disabled' | 'submitting' | 'prevented' | 'unknown'

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}
```
