```ts
/**
 * Configuration object of the form's autosave behavior, covering the remote
 * endpoint, the local draft mirror, and the remote scheduling options.
 */
type AutosaveProp<TContext = any> = {
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
```
