```ts
/**
 * One form's wired autosave and draft behavior: the manual remote trigger and
 * the draft methods, exposed on the form's context.
 */
type AutosaveInstance = {
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
   * Aborts the in-flight autosave request, if any. The aborted save settles
   * silently — no fail event fires. Scheduled saves (a running debounce, the
   * interval, a pending gated retry) are unaffected.
   */
  abortAutosave: () => void

  /**
   * Saves the current model snapshot to storage immediately, bypassing the
   * debounce (async because a configured `$security.encrypt` may be). Unlike
   * the automatic saves, a manual call fires no `saveDraft` pre-hook — calling
   * it is_ the consent (`draftSaved` still fires). Resolves whether a draft
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
   * `restoreDraft` pre-hook — calling it is_ the consent.
   */
  restoreDraft: () => Promise<boolean>

  /**
   * Removes the stored draft, if any. Unlike the automatic discard on
   * successful submit, a manual call fires no `discardDraft` pre-hook —
   * calling it is_ the consent.
   */
  discardDraft: () => void
}
```
