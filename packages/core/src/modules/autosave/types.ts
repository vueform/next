import type { ComputedRef, Ref } from 'vue'

import type { HttpResponse, RequestMethod } from '#src/modules/http'
import type { EndpointHandler } from '#src/types'

/**
 * Global options for the autosave module (the `$autosave` config object).
 */
export interface AutosaveModuleOptions {
  /**
   * The default storage backend for drafts, used by every form whose `draft`
   * config doesn't set its own `storage`. Defaults to `localStorage`.
   */
  storage?: DraftStorage
}

/**
 * Trigger options for the form's autosave behavior.
 */
export type AutosaveOnOptions = 'change' | 'next' | 'back' | 'step' | 'tab'

/**
 * Prop type specifying which events trigger autosave.
 */
export type AutosaveOnProp = (AutosaveOnOptions | (string & {}))[]

/**
 * A storage backend for drafts — the `localStorage` slice of the Web Storage
 * API, so `localStorage`, `sessionStorage`, and custom adapters all qualify.
 */
export type DraftStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

/**
 * Configuration object of the form's draft behavior.
 */
export type DraftConfig = {
  /**
   * The storage key. Defaults to `vueform:{form name}` — without a key or a
   * form `name`, drafts are disabled with a dev warning.
   */
  key?: string

  /**
   * The storage backend. Defaults to the app-level `$autosave.storage`, then
   * `localStorage`.
   */
  storage?: DraftStorage

  /**
   * Whether a stored draft is restored into the form on mount. Defaults to
   * `true`. When `false`, drafts can still be restored manually via
   * `restoreDraft()`.
   */
  restore?: boolean

  /**
   * Whether the stored draft is discarded on successful submit. Defaults to
   * `true`.
   */
  discardOnSuccess?: boolean

  /**
   * Whether the app-level `$security` cipher is applied to this form's draft.
   * Defaults to `true` — and storing drafts with no cipher configured warns in
   * dev: plaintext drafts must be a conscious choice. Set `false` to knowingly
   * store this form's draft as plaintext (and silence the warning);
   * registering identity `$security` ciphers is the app-wide equivalent.
   */
  encrypt?: boolean

  /**
   * Form events that trigger a draft save. Defaults to `['change']` — the
   * draft saves shortly after the form's data changes. `'change'` saves are
   * debounced (`debounce`); every other event saves immediately. Any form
   * event name is accepted. Listing `'step'` alongside `'next'`/`'back'` wires
   * only `'step'` (it fires on every step navigation, both directions) — one
   * navigation never triggers two saves. An empty array disables automatic
   * saving entirely — drafts are then written only via `saveDraft()`.
   */
  on?: AutosaveOnProp

  /**
   * Whether values of elements marked `sensitive` are stored in the draft.
   * Defaults to `false` — sensitive values are stripped by data path before
   * the draft is written. Set `true` to knowingly store them too.
   */
  sensitive?: boolean

  /**
   * Debounce delay in milliseconds applied to change-triggered draft saves,
   * bounding the synchronous model serialization work while the user types.
   * It also caps staleness: continuous typing flushes a save at least this
   * often. Defaults to `1000`. Navigation events always save immediately.
   */
  debounce?: number
}

/**
 * Configuration of the form's draft behavior: the model is saved to storage on
 * the configured `on` events (debounced change saves by default, regardless of
 * validity), restored on mount, and discarded on successful submit. `true`
 * enables drafts with the defaults (`localStorage` under a key derived from
 * the form's `name`).
 */
export type DraftProp = boolean | DraftConfig

/**
 * Configuration object of the form's remote autosave behavior: the `endpoint`
 * with its scheduling options.
 */
export type AutosaveConfig<TContext = any> = {
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
   * Form events that trigger a remote save (e.g. `change`, `next`, `step`,
   * `tab`). Any form event name is accepted. Defaults to `['change']` — the
   * form saves shortly after its data changes. Listing `step` alongside
   * `next`/`back` wires only `step` (it fires on every step navigation, both
   * directions) — one navigation never triggers two saves.
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
  debounce?: number

  /**
   * Whether remote saves are sent while the form is invalid. Defaults to
   * `false` — a save triggered while the form is invalid is deferred and runs
   * as soon as the form becomes valid.
   */
  invalid?: boolean

  /**
   * Whether values of elements marked `sensitive` are sent in remote saves.
   * Defaults to `false` — sensitive values are stripped by data path from the
   * autosaved payload. Set `true` to knowingly send them too. Regular submits
   * are unaffected: they always carry the full payload.
   */
  sensitive?: boolean

  /**
   * Further transforms the data a remote save sends. Receives the form's
   * payload (with `transformPayload` already applied and sensitive values
   * stripped unless `sensitive: true`) and returns the data to send. Drafts
   * are unaffected.
   */
  transform?: (
    data: Record<string, any>,
    context$: TContext
  ) => Record<string, any>
}

/**
 * Configuration of the form's remote autosave behavior. A string is shorthand
 * for `{ endpoint }`.
 */
export type AutosaveProp<TContext = any> = string | AutosaveConfig<TContext>

/**
 * Result passed to the `autosaveSuccess` event when a save's response has a
 * 2xx status — the same shape as a submission's success result.
 */
export interface AutosaveSuccess {
  /**
   * The result type discriminator, always 'success'.
   */
  type: 'success'

  /**
   * The response data returned by the server.
   */
  data: any

  /**
   * The HTTP status code of the response.
   */
  status: number

  /**
   * The full HTTP response object.
   */
  response: HttpResponse

  /**
   * The form context instance at the time of the save.
   */
  context$: any
}

/**
 * Result passed to the `autosaveFail` event when a save fails — a request
 * error, or a response with a non-2xx status. The same shape as a submission's
 * fail result, with two differences: `reason` includes `'invalid'` (a 422 —
 * autosave has no separate server-invalid event) and never `'abort'` (an
 * aborted or superseded save settles silently).
 */
export interface AutosaveFail {
  /**
   * The result type discriminator, always 'fail'.
   */
  type: 'fail'

  /**
   * The category of the failure.
   */
  reason:
    | 'network'
    | 'invalid'
    | 'timeout'
    | 'http'
    | 'blocked'
    | 'ssr'
    | 'unknown'

  /**
   * The HTTP status code, or null if no response was received.
   */
  status: number | null

  /**
   * A human-readable error message describing the failure.
   */
  message: string

  /**
   * The response data if available, or null.
   */
  data: any | null

  /**
   * The HTTP response object if available, or null.
   */
  response: HttpResponse | null

  /**
   * The form context instance at the time of the save.
   */
  context$: any
}

/**
 * Configuration options for `makeAutosave`, wiring one form's autosave and
 * draft behavior.
 */
export type MakeAutosaveOptions = {
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

/**
 * One form's wired autosave and draft behavior: the manual remote trigger and
 * the draft methods, exposed on the form's context.
 */
export type AutosaveInstance = {
  /**
   * Performs a remote autosave immediately (when `autosave` is configured).
   * The validity gate applies as configured; pass `invalid` to override the
   * config's `invalid` option for this one call — `true` sends even while the
   * form is invalid, `false` enforces the gate. A gated call while the form is
   * invalid defers the save: it runs as soon as the form becomes valid.
   *
   * @param options Per-call overrides (`invalid`).
   */
  autosave: (options?: { invalid?: boolean }) => Promise<void>

  /**
   * Aborts the autosave that's underway or queued — the in-flight request, a
   * running change debounce, and a deferred gated save. Everything settles
   * silently, firing no fail event. Autosaving itself stays on — the triggers
   * and the interval keep arming future saves.
   */
  abortAutosave: () => void

  /**
   * Saves the current model snapshot to storage immediately, bypassing the
   * debounce (async because a configured `$security.encrypt` may be). Unlike
   * the automatic saves, a manual call fires no `saveDraft` pre-hook — calling
   * it _is_ the consent (`draftSaved` still fires). Resolves whether a draft
   * was written — `false` when drafts are inactive, or the write was
   * superseded or failed.
   */
  saveDraft: () => Promise<boolean>

  /**
   * Resolves the stored draft data without loading it into the form, or
   * `undefined` when there's nothing (valid) stored (async because a
   * configured `$security.decrypt` may be).
   */
  getDraft: () => Promise<Record<string, any> | undefined>

  /**
   * Restores the stored draft into the form, resolving whether a draft was
   * found and restored (async because a configured `$security.decrypt` may
   * be). Unlike the automatic restore on mount, a manual call fires no
   * `restoreDraft` pre-hook — calling it _is_ the consent.
   */
  restoreDraft: () => Promise<boolean>

  /**
   * Removes the stored draft, if any. Unlike the automatic discard on
   * successful submit, a manual call fires no `discardDraft` pre-hook —
   * calling it _is_ the consent.
   */
  discardDraft: () => void
}

/**
 * The autosave module: wires remote interval and event saving, and the draft
 * mirror, for a form from its `autosave` and `draft` configuration.
 */
export interface AutosaveModule {
  /**
   * Wires a form's autosave and draft behavior from the given options. Must be
   * called within a component setup context (registers lifecycle hooks and
   * watchers).
   *
   * @param options The form-specific autosave wiring options.
   */
  makeAutosave: (options: MakeAutosaveOptions) => AutosaveInstance
}
