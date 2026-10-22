```ts
/**
 * The inert autosave surface used when the `autosave` module is not registered
 * — the `autosave` and `draft` props have no effect (with a one-time dev
 * warning when either is set) and the form context methods (`autosave`,
 * `getDraft`, `restoreDraft`, `discardDraft`) are no-ops.
 */
const noopAutosave: AutosaveModule
```
