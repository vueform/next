```ts
/**
 * The submission-related events shared between the form blueprint and
 * `useModel`'s callbacks.
 */
interface SubmissionEmits<TContext = any> {
  /**
   * Emitted when the form becomes invalid due to client-side validation errors.
   *
   * @param context$ The form's component context.
   */
  invalid: [context$: TContext]

  /**
   * Emitted when the form passes validation.
   *
   * @param context$ The form's component context.
   */
  valid: [context$: TContext]

  /**
   * Emitted when the form is submitted, before the HTTP request is sent.
   *
   * @param payload The submitted form payload.
   * @param context$ The form's component context.
   */
  submit: [payload: FormData | Record<string, any>, context$: TContext]

  /**
   * Emitted when an HTTP response is received from the server.
   *
   * @param response The HTTP response object.
   */
  response: [response: HttpResponse]

  /**
   * Emitted when form submission fails due to a network or server error.
   *
   * @param result The failure result object.
   */
  fail: [result: SubmitFail]

  /**
   * Emitted when a submission attempt fails client-side validation, before any
   * request is made.
   *
   * @param result The client-invalid result object.
   */
  clientInvalid: [result: SubmitClientInvalid]

  /**
   * Emitted when form submission fails due to server-side validation errors
   * (a 422 response).
   *
   * @param result The server-invalid result object.
   */
  serverInvalid: [result: SubmitServerInvalid]

  /**
   * Emitted when form submission succeeds.
   *
   * @param result The success result object.
   */
  success: [result: SubmitSuccess]

  /**
   * Emitted when form submission is cancelled before sending a request (e.g.
   * the form is invalid, loading, disabled, already submitting, or a `submit`
   * handler / `endpoint` function returned `false`).
   *
   * @param result The cancelled result object.
   */
  cancelled: [result: SubmitCancelled]
}
```
