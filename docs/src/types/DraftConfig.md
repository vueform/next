```ts
/**
 * Configuration object of the form's draft behavior.
 */
type DraftConfig = {
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
```
