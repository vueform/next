```ts
/**
 * The autosave module: wires interval, event, and local-draft saving for a form
 * from its `autosave` configuration object.
 */
interface AutosaveModule {
  /**
   * Wires a form's autosave behavior from the given options. Must be called
   * within a component setup context (registers lifecycle hooks and watchers).
   *
   * @param options The form-specific autosave wiring options.
   */
  makeAutosave: (options: MakeAutosaveOptions) => AutosaveInstance
}
```
