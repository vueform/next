```ts
/**
 * The host-independent submission flow shared by the form blueprint and
 * `useModel`: cancellation guards, the submit-time validation floor, the
 * `submit` event / endpoint dispatch chain, request encoding, and the
 * success / fail / server-invalid / cancelled result handling with their
 * events. Hosts contribute state and UX through the options' accessors and
 * hooks; everything here is component-free.
 *
 * @param options The host accessors and hooks the flow runs against.
 */
function useSubmission(options: UseSubmissionOptions): {
  /**
   * The number of times the form has been submitted.
   */
  submits: Ref<number, number>

  /**
   * Whether the form is currently being submitted.
   */
  submitting: Ref<boolean, boolean>

  /**
   * Whether the form is currently being validated.
   */
  validating: Ref<boolean, boolean>

  /**
   * The HTTP response from the most recent submission.
   */
  response: Ref<HttpResponse<any> | undefined, HttpResponse<any> | undefined>

  /**
   * The result object from the most recent submission attempt.
   */
  result: Ref<SubmitResult | undefined, SubmitResult | undefined>

  /**
   * Validates and submits the form, returning a result describing the outcome.
   */
  submit: () => Promise<SubmitResult | undefined>

  /**
   * Aborts the current in-flight submission request.
   */
  abort: () => void
}
```
