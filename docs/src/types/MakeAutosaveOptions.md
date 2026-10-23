```ts
/**
 * Configuration options for `makeAutosave`, wiring one form's autosave and
 * draft behavior.
 */
type MakeAutosaveOptions = {
  /**
   * The remote autosave configuration. When undefined, remote autosave is
   * disabled.
   */
  autosave: Ref<AutosaveProp | undefined>

  /**
   * The draft configuration. When undefined or `false`, drafts are disabled.
   */
  draft: Ref<DraftProp | undefined>

  /**
   * The form's submission payload (with `transformPayload` applied).
   */
  payload: ComputedRef<Record<string, any>>

  /**
   * The form's raw model data (before any form-level transform).
   */
  model: Ref<Record<string, any>>

  /**
   * Data paths of elements marked `sensitive` — their values are stripped from
   * stored drafts and remote autosave payloads (unless the respective config
   * sets `sensitive: true`).
   */
  sensitivePaths: ComputedRef<string[]>

  /**
   * Custom HTTP headers to include in autosave requests.
   */
  headers: Ref<Record<string, string> | undefined>

  /**
   * Whether to send autosave data as JSON instead of FormData.
   */
  json: Ref<boolean | undefined>

  /**
   * Whether to encode file uploads as base64 in autosave requests.
   */
  base64: Ref<boolean | undefined>

  /**
   * Whether the form is currently invalid. Unless the autosave config sets
   * `invalid: true`, remote saves are skipped while this is `true`.
   */
  invalid: ComputedRef<boolean>

  /**
   * The form's `name` prop, used as the default draft storage key.
   */
  name: Ref<string | undefined>

  /**
   * Loads data into the form's model (used to restore drafts).
   *
   * @param data The data to load into the form's model.
   */
  load: (data: Record<string, any>) => void

  /**
   * The form's component context, passed to handlers and events.
   */
  form$: any

  /**
   * Resolves expressions in a string endpoint URL (when allowed for the
   * `autosave` prop key).
   */
  resolveEndpoint: (url: string) => string

  /**
   * Fires a form event synchronously.
   */
  fire: {
    /**
     * Fires the autosaveResponse event when an autosave request receives a
     * response, successful or not.
     *
     * @param e The event name.
     * @param response The HTTP response the autosave request received.
     * @param form$ The form context.
     */
    (e: 'autosaveResponse', response: HttpResponse, form$: any): any

    /**
     * Fires the autosaveSuccess event when a save's response has a 2xx status.
     *
     * @param e The event name.
     * @param result The success result.
     * @param form$ The form context.
     */
    (e: 'autosaveSuccess', result: AutosaveSuccess, form$: any): any

    /**
     * Fires the autosaveFail event when a save fails — a request error, or a
     * response with a non-2xx status.
     *
     * @param e The event name.
     * @param result The failure result.
     * @param form$ The form context.
     */
    (e: 'autosaveFail', result: AutosaveFail, form$: any): any

    /**
     * Fires the draftSaved event after a draft was written to storage.
     *
     * @param e The event name.
     * @param data The stored draft data.
     * @param form$ The form context.
     */
    (e: 'draftSaved', data: Record<string, any>, form$: any): any

    /**
     * Fires the draftRestored event after a stored draft was loaded into the
     * form, by the automatic restore on mount or a manual `restoreDraft()`.
     *
     * @param e The event name.
     * @param data The restored draft data.
     * @param form$ The form context.
     */
    (e: 'draftRestored', data: Record<string, any>, form$: any): any

    /**
     * Fires the draftDiscarded event after the stored draft was removed.
     *
     * @param e The event name.
     * @param form$ The form context.
     */
    (e: 'draftDiscarded', form$: any): any
  }

  /**
   * Fires a form event asynchronously, awaiting each callback. Returns `false`
   * if any handler cancels, or the last non-undefined return value.
   */
  fireAsync: {
    /**
     * Fires the autosave pre-hook event before the remote request is sent.
     *
     * @param e The event name.
     * @param data The form data to be autosaved.
     * @param form$ The form context.
     */
    (e: 'autosave', data: Record<string, any>, form$: any): Promise<any>

    /**
     * Fires the saveDraft pre-hook event before a draft is written to storage.
     *
     * @param e The event name.
     * @param data The draft data about to be stored.
     * @param form$ The form context.
     */
    (e: 'saveDraft', data: Record<string, any>, form$: any): Promise<any>

    /**
     * Fires the restoreDraft pre-hook event before a stored draft is restored
     * into the form on mount.
     *
     * @param e The event name.
     * @param data The stored draft data about to be restored.
     * @param form$ The form context.
     */
    (e: 'restoreDraft', data: Record<string, any>, form$: any): Promise<any>

    /**
     * Fires the discardDraft pre-hook event before the stored draft is
     * discarded on successful submit.
     *
     * @param e The event name.
     * @param form$ The form context.
     */
    (e: 'discardDraft', form$: any): Promise<any>
  }

  /**
   * Subscribes a callback to a form event.
   *
   * @param e The event name to listen for.
   * @param callback The handler to invoke when the event fires.
   */
  on: (e: any, callback: (...args: any[]) => any) => any

  /**
   * Unsubscribes a callback from a form event.
   *
   * @param e The event name to stop listening for.
   * @param callback The handler to remove.
   */
  off: (e: any, callback: (...args: any[]) => any) => any
}
```
