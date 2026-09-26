import type { HttpError, HttpResponse, RequestMethod } from '#core/modules/http'
import type { EndpointHandler } from '#core/types'
import type { ComputedRef, Ref } from 'vue'

/**
 * Global options for the autosave module (the `$autosave` config object).
 */
export interface AutosaveModuleOptions {}

/**
 * Trigger options for the form's autosave behavior.
 */
export type AutosaveOnOptions = 'change' | 'next' | 'back' | 'step' | 'tab'

/**
 * Prop type specifying which events trigger autosave.
 */
export type AutosaveOnProp = (AutosaveOnOptions | (string & {}))[]

/**
 * A storage backend for local autosave — the `localStorage` slice of the Web
 * Storage API, so `localStorage`, `sessionStorage`, and custom adapters all
 * qualify.
 */
export type AutosaveStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

/**
 * Configuration of the local half of autosave. `true` enables it with the
 * defaults (`localStorage` under a key derived from the form's `name`).
 */
export type AutosaveLocalProp =
  | boolean
  | {
      /**
       * The storage key. Defaults to `vueform:{form name}` — without a key or a
       * form `name`, local autosave is disabled with a dev warning.
       */
      key?: string

      /**
       * The storage backend. Defaults to `localStorage`.
       */
      storage?: AutosaveStorage

      /**
       * Whether a stored draft is loaded back into the form on mount. Defaults
       * to `true`. When `false`, drafts can still be loaded manually via
       * `loadAutosaved()`.
       */
      load?: boolean

      /**
       * Whether the stored draft is cleared on successful submit. Defaults to
       * `true`.
       */
      clear?: boolean

      /**
       * Whether the app-level `$security` cipher is applied to this form's
       * draft. Defaults to `true` — and storing drafts with no cipher
       * configured warns in dev: plaintext drafts must be a conscious choice.
       * Set `false` to knowingly store this form's draft as plaintext (and
       * silence the warning); registering identity `$security` ciphers is the
       * app-wide equivalent.
       */
      encrypt?: boolean
    }

/**
 * Configuration object of the form's autosave behavior, covering the remote
 * endpoint, the local draft mirror, and the remote scheduling options.
 */
export type AutosaveProp<TContext = any> = {
  /**
   * The remote target — an endpoint URL (expressions are resolved) or an async
   * handler function.
   */
  endpoint?: string | EndpointHandler<TContext>

  /**
   * The HTTP method for endpoint requests. Defaults to `'POST'`.
   */
  method?: RequestMethod

  /**
   * The local draft mirror. Saves the form's model to storage on every action
   * (change and page navigation, undebounced and regardless of validity), loads
   * it back on mount (`load: false` to disable), and clears it on successful
   * submit (`clear: false` to keep it).
   */
  local?: AutosaveLocalProp

  /**
   * Form events that trigger a remote save (e.g. `change`, `next`, `step`,
   * `tab`). Any form event name is accepted. Defaults to `['change']` — the
   * form saves shortly after its data changes.
   */
  on?: AutosaveOnProp

  /**
   * Interval in milliseconds for periodic remote saves on a fixed schedule. The
   * timer fires regardless of the last save's outcome, so it also retries after
   * failed saves. Defaults to `0` (no timer).
   */
  interval?: number

  /**
   * Debounce delay in milliseconds applied when `on` includes `'change'`.
   * Defaults to `1000`.
   */
  delay?: number

  /**
   * Whether remote saves are sent while the form is invalid. Defaults to
   * `false` — a save triggered while the form is invalid is deferred and runs
   * as soon as the form becomes valid.
   */
  invalid?: boolean

  /**
   * Further transforms the data a remote save sends. Receives the form's
   * payload (with `transformPayload` already applied) and returns the data to
   * send. Local drafts are unaffected.
   */
  transform?: (
    data: Record<string, any>,
    context$: TContext
  ) => Record<string, any>
}

/**
 * Configuration options for `makeAutosave`, wiring one form's autosave
 * behavior.
 */
export type MakeAutosaveOptions = {
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

/**
 * One form's wired autosave behavior: the manual trigger and the local draft
 * methods, exposed on the form's context.
 */
export type AutosaveInstance = {
  /**
   * Performs an autosave immediately: writes the local draft (when `local` is
   * configured) and runs the remote save (when `endpoint` is configured). The
   * validity gate applies as configured; pass `invalid` to override the
   * config's `invalid` prop for this one call — `true` sends even while the
   * form is invalid, `false` enforces the gate. A gated call while the form is
   * invalid still writes the local draft and defers the remote save.
   *
   * @param options Per-call overrides (`invalid`).
   */
  autosave: (options?: { invalid?: boolean }) => Promise<void>

  /**
   * Removes the locally stored draft, if any.
   */
  clearAutosaved: () => void

  /**
   * Loads the stored draft into the form, resolving whether a draft was found
   * and loaded (async because a configured `$security.decrypt` may be). Unlike
   * the automatic load on mount, a manual call fires no `autosaveRestore`
   * pre-hook — calling it _is_ the consent.
   */
  loadAutosaved: () => Promise<boolean>
}

/**
 * The autosave module: wires interval, event, and local-draft saving for a form
 * from its `autosave` configuration object.
 */
export interface AutosaveModule {
  /**
   * Wires a form's autosave behavior from the given options. Must be called
   * within a component setup context (registers lifecycle hooks and watchers).
   *
   * @param options The form-specific autosave wiring options.
   */
  makeAutosave: (options: MakeAutosaveOptions) => AutosaveInstance
}
