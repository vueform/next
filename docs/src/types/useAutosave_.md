```ts
/**
 * Wires a form's saving behavior through the `autosave` module: remote saves
 * on the configured events and interval, and a draft mirror. Setup-only:
 * throws when called outside a component setup context.
 *
 * @param options Form-specific autosave wiring options.
 */
function useAutosave(options: UseAutosaveOptions): AutosaveInstance
```
