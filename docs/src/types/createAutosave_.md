```ts
/**
 * Creates an autosave instance from the given app config (`$autosave` may
 * provide the default draft `storage`). The returned module's `makeAutosave`
 * wires one form's
 * saving behavior: remote autosaves to `endpoint` on the configured events and
 * interval (deferred while the form is invalid unless `invalid: true` — a
 * skipped save runs when the form becomes valid), and a `draft` mirror that
 * saves the model to storage on every action, restores it on mount, and
 * discards it on successful submit.
 *
 * @param vueform The Vueform instance; its config (`$autosave.storage` is the
 *   default draft storage; `$security` is peeked at to warn when drafts would
 *   be stored without any cipher).
 */
function createAutosave(vueform: VueformInstance): AutosaveModule
```
