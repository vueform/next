```ts
/**
 * One form's wired autosave behavior: the manual trigger and the local draft
 * methods, exposed on the form's context.
 */
type AutosaveInstance = {
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
   * pre-hook — calling it is_ the consent.
   */
  loadAutosaved: () => Promise<boolean>
}
```
