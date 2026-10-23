```ts
/**
 * Result returned when form submission is canceled before sending a request.
 */
interface SubmitCanceled {
  /**
   * The result type discriminator, always 'canceled'.
   */
  type: 'canceled'

  /**
   * The reason the submission was canceled (e.g. form was invalid, disabled,
   * or already submitting).
   */
  reason: 'loading' | 'disabled' | 'submitting' | 'prevented' | 'unknown'

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}
```
