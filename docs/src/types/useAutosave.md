```ts
/**
 * Wires a form's autosave behavior through the `autosave` module: remote saves
 * to `endpoint` on the configured events and interval (deferred while the form
 * is invalid unless `invalid: true`), and a `local` draft mirror that saves the
 * model to storage on every action, loads it back on mount, and clears it on
 * successful submit. Setup-only: throws when called outside a component setup
 * context. When the `autosave` module is not registered, its inert surface
 * takes over: the `autosave` prop has no effect (with a dev warning) and the
 * returned methods are no-ops.
 *
 * @param options Form-specific autosave wiring options.
 */
function useAutosave(options: UseAutosaveOptions): AutosaveInstance
```
