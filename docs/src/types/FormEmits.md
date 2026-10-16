```ts
/**
 * Events emitted by the form component.
 */
interface FormEmits<TContext = any>
  extends BaseComponentEmits<TContext>, TabbedEmits {
  /**
   * Emitted when the active step changes.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  step: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted when navigating to the previous step.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  back: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted when navigating to the next step.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  next: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted before the active step changes, allowing cancellation.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  beforeStep: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted before navigating to the previous step, allowing cancellation.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  beforeBack: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted before navigating to the next step, allowing cancellation.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  beforeNext: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted before the form finishes (submits from the last step), allowing
   * cancellation.
   *
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  beforeFinish: [pager: Pager, context$: TContext]

  /**
   * Emitted when any form element's value changes, with the new and previous
   * values.
   *
   * @param newValue The new form data.
   * @param oldValue The previous form data.
   * @param context$ The component context.
   */
  change: [
    newValue: Record<string, any>,
    oldValue: Record<string, any>,
    context$: TContext,
  ]

  /**
   * Emitted when the form is reset to its default values.
   *
   * @param context$ The form's component context.
   */
  reset: [context$: TContext]

  /**
   * Emitted when the form is cleared.
   *
   * @param context$ The form's component context.
   */
  clear: [context$: TContext]

  /**
   * Emitted when form data is loaded programmatically via the `load` method.
   *
   * @param value The loaded model value.
   * @param context$ The form's component context.
   */
  load: [value: any, context$: TContext]

  /**
   * Emitted before the autosave request is sent. Return `false` to cancel, a
   * `string` to use as the endpoint URL, or an `HttpResponse` to use as the
   * result without making a request.
   *
   * @param payload The form payload to be autosaved.
   * @param context$ The form's component context.
   */
  autosave: [payload: Record<string, any>, context$: TContext]

  /**
   * Emitted before a locally stored autosave draft is restored into the form on
   * mount. Return `false` to skip the restore (the stored draft is kept).
   *
   * @param data The stored draft data about to be loaded.
   * @param context$ The form's component context.
   */
  autosaveRestore: [data: Record<string, any>, context$: TContext]

  /**
   * Emitted after a successful autosave operation.
   *
   * @param response The HTTP response from the autosave request.
   * @param context$ The form's component context.
   */
  autosaveSuccess: [response: HttpResponse, context$: TContext]

  /**
   * Emitted when an autosave request fails due to a network or server error.
   *
   * @param error The HTTP error that caused the failure.
   * @param context$ The form's component context.
   */
  autosaveFail: [error: HttpError, context$: TContext]

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
   * Emitted when form submission fails due to validation errors.
   *
   * @param result The invalid result object.
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

  /**
   * Emitted to update the v-model binding.
   *
   * @param value The new model value.
   */
  'update:modelValue': [value: Record<string, any>]
}
```
