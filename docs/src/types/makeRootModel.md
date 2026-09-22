```ts
/**
 * Creates the root-level reactive model for a form, providing model sync,
 * registration, and lifecycle methods.
 *
 * Always backed by a model store and schema index: when `modelValue` holds a
 * `useModel` instance the form adopts its store and index (the store stays the
 * single source of truth — no v-model emission or inbound watcher), otherwise a
 * store is created internally from the plain `modelValue` and kept in sync with
 * it, with an empty index filled by mounted registration.
 *
 * @param options Root model configuration object.
 */
function makeRootModel(options: MakeRootModelOptions): RootModel
```
