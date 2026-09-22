```ts
/**
 * Configuration options for `makeAutosave`, wiring one form's autosave
 * behavior.
 */
type MakeAutosaveOptions = {
  /**
   * The autosave configuration object. When undefined, autosave is disabled.
   */
  autosave: Ref<AutosaveProp | undefined>

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
   * locally stored drafts.
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
   * The form's `name` prop, used as the default local storage key.
   */
  name: Ref<string | undefined>

  /**
   * Loads data into the form's model (used to restore local drafts).
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
     * Fires the autosaveSuccess event after a successful save request.
     *
     * @param e The event name.
     * @param response The HTTP response from the autosave request.
     * @param form$ The form context.
     */
    (e: 'autosaveSuccess', response: HttpResponse, form$: any): any

    /**
     * Fires the autosaveFail event after a failed save request.
     *
     * @param e The event name.
     * @param error The HTTP error that caused the failure.
     * @param form$ The form context.
     */
    (e: 'autosaveFail', error: HttpError, form$: any): any
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
     * Fires the autosaveRestore pre-hook event before a stored draft is loaded
     * back into the form.
     *
     * @param e The event name.
     * @param data The stored draft data about to be restored.
     * @param form$ The form context.
     */
    (e: 'autosaveRestore', data: Record<string, any>, form$: any): Promise<any>
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
