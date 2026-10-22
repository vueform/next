```ts
/**
 * Configuration object of the form's remote autosave behavior: the `endpoint`
 * with its scheduling options.
 */
type AutosaveConfig<TContext = any> = {
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
```
