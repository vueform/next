```ts
/**
 * Events emitted by the form component.
 */
interface FormEmits<TContext = any>
  extends BaseComponentEmits<TContext>, TabbedEmits, SubmissionEmits<TContext> {
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
   * Emitted before a draft is written to storage. Return `false` to cancel the
   * write.
   *
   * @param data The draft data about to be stored.
   * @param context$ The form's component context.
   */
  saveDraft: [data: Record<string, any>, context$: TContext]

  /**
   * Emitted after a draft was written to storage.
   *
   * @param data The stored draft data.
   * @param context$ The form's component context.
   */
  draftSaved: [data: Record<string, any>, context$: TContext]

  /**
   * Emitted before a stored draft is restored into the form on mount. Return
   * `false` to skip the restore (the stored draft is kept).
   *
   * @param data The stored draft data about to be restored.
   * @param context$ The form's component context.
   */
  restoreDraft: [data: Record<string, any>, context$: TContext]

  /**
   * Emitted before the stored draft is discarded on successful submit. Return
   * `false` to keep the draft.
   *
   * @param context$ The form's component context.
   */
  discardDraft: [context$: TContext]

  /**
   * Emitted after the stored draft was removed.
   *
   * @param context$ The form's component context.
   */
  draftDiscarded: [context$: TContext]

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
   * Emitted after an autosave completed without failing — including handler
   * function saves that produce no HTTP response.
   *
   * @param response The HTTP response from the autosave, or `undefined` when
   *   the save produced none.
   * @param context$ The form's component context.
   */
  autosaved: [response: HttpResponse | undefined, context$: TContext]

  /**
   * Emitted whenever an autosave request receives an HTTP response, successful
   * or not.
   *
   * @param response The HTTP response the autosave received.
   * @param context$ The form's component context.
   */
  autosaveResponse: [response: HttpResponse, context$: TContext]

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
   * Emitted to update the v-model binding.
   *
   * @param value The new model value.
   */
  'update:modelValue': [value: Record<string, any>]
}
```
