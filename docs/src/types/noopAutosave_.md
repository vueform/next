```ts
/**
 * The inert autosave surface used when the `autosave` module is not registered
 * — the `autosave` prop has no effect (with a one-time dev warning when it is
 * set) and the form context methods (`autosave`, `clearAutosaved`,
 * `loadAutosaved`) are no-ops.
 */
const noopAutosave: AutosaveModule
```
