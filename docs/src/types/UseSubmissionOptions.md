```ts
/**
 * Configuration options for `useSubmission`: the host-independent accessors and
 * hooks the submission flow runs against. The form blueprint supplies props and
 * mounted UX hooks; `useModel` supplies its options and headless equivalents.
 */
type UseSubmissionOptions = {
  /**
   * The context passed to events, transforms, endpoint functions, and results.
   */
  context$: any

  /**
   * The http instance used for endpoint submissions.
   */
  http: HttpInstance

  /**
   * Returns the current submission payload.
   */
  payload: () => any

  /**
   * Applies (partial) data to the model — backs `setResponse`.
   */
  update: (data: Record<string, any>) => void

  /**
   * Runs the host's submit-time validation (the host decides forcing).
   */
  validate: () => Promise<unknown> | unknown

  /**
   * Whether the model is currently invalid.
   */
  invalid: () => boolean

  /**
   * Whether the host has disabled the submit-time validation floor (the form's
   * `disableValidation()`). Omitted, validation always runs.
   */
  validationDisabled?: () => boolean

  /**
   * Current validation errors keyed by element path.
   */
  errors: () => Record<string, string[]>

  /**
   * Current structured validation issues.
   */
  issues: () => Issue[]

  /**
   * The active endpoint: a handler function, or an already-resolved URL string.
   */
  endpoint: () => EndpointProp | undefined

  /**
   * The HTTP method for the submission request.
   */
  method: () => RequestMethod | undefined

  /**
   * Custom HTTP headers for the submission request.
   */
  headers: () => Record<string, string> | undefined

  /**
   * Whether to send the payload as JSON instead of FormData.
   */
  json: () => boolean | undefined

  /**
   * Whether to encode file uploads as base64.
   */
  base64: () => boolean | undefined

  /**
   * Whether 422 server errors should be applied via `applyServerErrors`.
   */
  setInvalid: () => boolean | undefined

  /**
   * Whether to update the model with the (transformed) server response data.
   */
  setResponse: () => boolean | undefined

  /**
   * The server-error transform; `defaultTransformServerInvalid` when undefined.
   */
  transformServerInvalid?: () =>
    | ((data: any, context$: any) => Record<string, any>)
    | undefined

  /**
   * The response transform; `defaultTransformResponse` when undefined.
   */
  transformResponse?: () => ((data: any, context$: any) => any) | undefined

  /**
   * Fires a submission event synchronously.
   */
  fire: (e: any, ...args: any[]) => any

  /**
   * Fires a submission event asynchronously, honoring `false` cancellation.
   */
  fireAsync: (e: any, ...args: any[]) => Promise<any>

  /**
   * Returns a cancellation reason from host state (e.g. `loading`/`disabled`),
   * or undefined when the host allows submission. An in-flight submission is
   * always canceled regardless.
   */
  cancelReason?: () => 'loading' | 'disabled' | undefined

  /**
   * Runs after a client-side validation failure (e.g. focus/scroll to the first
   * error).
   */
  onClientInvalid?: () => Promise<void> | void

  /**
   * Applies 422 server errors to the host's error surface (element message
   * bags on a mounted form; the instance's server errors headlessly). Only
   * called when `setInvalid()` is true.
   *
   * @param errors The coerced server errors keyed by element path.
   */
  applyServerErrors?: (errors: Record<string, string[]>) => Promise<void> | void

  /**
   * Runs right after the `success` event, before `setResponse` is applied
   * (the form shows its success message and runs reset/clear-on-success here).
   *
   * @param result The success result.
   */
  onSuccess?: (result: SubmitSuccess) => Promise<void> | void

  /**
   * Runs at the very end of a successful submission, after `setResponse`
   * (the form scrolls to top and redirects here).
   *
   * @param result The success result.
   */
  onAfterSuccess?: (result: SubmitSuccess) => Promise<void> | void
}
```
