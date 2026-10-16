```ts
/**
 * Creates an autosave instance from the given app config (`$autosave` is
 * currently reserved). The returned module's `makeAutosave` wires one form's
 * autosave behavior: remote saves to `endpoint` on the configured events and
 * interval (deferred while the form is invalid unless `invalid: true` — a
 * skipped save runs when the form becomes valid), and a `local` draft mirror
 * that saves the model to storage on every action, loads it back on mount, and
 * clears it on successful submit.
 *
 * @param vueform The Vueform instance; its config (`$autosave` is reserved;
 *   `$security` is peeked at to warn when local drafts would be stored without
 *   any cipher).
 */
function createAutosave(vueform: VueformInstance): AutosaveModule
```
