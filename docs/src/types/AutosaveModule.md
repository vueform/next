```ts
/**
 * The autosave module: wires remote interval and event saving, and the draft
 * mirror, for a form from its `autosave` and `draft` configuration.
 */
interface AutosaveModule {
  /**
   * Wires a form's autosave and draft behavior from the given options. Must be
   * called within a component setup context (registers lifecycle hooks and
   * watchers).
   *
   * @param options The form-specific autosave wiring options.
   */
  makeAutosave: (options: MakeAutosaveOptions) => AutosaveInstance
}
```
