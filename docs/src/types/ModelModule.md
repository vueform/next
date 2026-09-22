```ts
/**
 * The model module instance: a stateless factory capturing the app config.
 * `make` builds a standalone form model from a schema — per-form state lives in
 * the returned `ModelInstance`, not the module. The model kit (root / child
 * model creation, the data store, mounted-node creation, and instance branding)
 * is config-free and also available on the fallback surface when the module is
 * not registered.
 */
interface ModelModule {
  /**
   * Creates the root-level reactive model for a form, providing model sync,
   * registration, and lifecycle methods.
   */
  makeRootModel: typeof makeRootModel

  /**
   * Creates the reactive model for a child element by reading from its parent
   * container's model, mirroring the lifecycle interface of `makeRootModel`.
   */
  makeChildModel: typeof makeChildModel

  /**
   * Creates a standalone reactive model store.
   */
  makeModelStore: typeof makeModelStore

  /**
   * Creates an index node for a mounted element the schema walk didn't produce.
   */
  makeMountedNode: typeof makeMountedNode

  /**
   * Whether a value carries a model store (a `useModel` instance).
   */
  hasModelStore: typeof hasModelStore

  /**
   * Creates a standalone form model from a schema: the full data shape is built
   * up front from the elements' model metadata (defaults, null values,
   * translatable expansion), without mounting any components.
   *
   * @param schema The form schema describing the model's shape. When a
   *   ref/computed is passed (e.g. from `defineComputedSchema`), the instance
   *   follows schema changes: the index is reconciled in place, added elements
   *   seed their defaults, removed elements drop their data, and the headless
   *   engines re-wire — existing values and expression untrack state survive.
   * @param model Initial (partial) data cloned over the schema defaults. A Vue
   *   ref is rejected (dev warn, seed ignored) — pass a plain or reactive
   *   object. Later mutations of the seed are ignored.
   * @param validationSchema A Standard Schema run by `validate()` against the
   *   whole model; overrides one attached via `defineSchema`.
   */
  make<const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>>(
    schema: S | Ref<S>,
    model?: DeepPartial<SchemaToModel<S>> & Record<string, any>,
    validationSchema?: StandardSchemaV1
  ): ModelInstance<S>
  make(
    schema: FormSchema | Ref<FormSchema>,
    model?: Record<string, any>,
    validationSchema?: StandardSchemaV1
  ): ModelInstance
}
```
