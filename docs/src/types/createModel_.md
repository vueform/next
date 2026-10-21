```ts
/**
 * Creates the model module instance from the app config. The module is a
 * stateless factory: `make` builds standalone form models from schemas using
 * the component definitions registered in the config, while per-form state
 * lives in the produced instances.
 *
 * The returned instances own their data and expose the familiar data API
 * (`update` / `load` / `clear` / `reset` / `clean`, `dirty` / `empty`,
 * path-based `get` / `set`, `toJSON` / `toFormData`). Passing one to a form's
 * `v-model` (or `useForm`) makes the form attach it — the same store is shared
 * without cloning, and `submit()` submits the attaching form.
 *
 * @param vueform The owning instance, whose config the model shape depends on
 *   via the registered component definitions.
 */
function createModel(vueform: VueformInstance): ModelModule
```
