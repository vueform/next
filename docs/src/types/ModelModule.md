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
   * @param options.schema The form schema describing the model's shape. When a
   *   ref/computed is passed (e.g. from `defineComputedSchema`), the instance
   *   follows schema changes: the index is reconciled in place, added elements
   *   seed their defaults, removed elements drop their data, and the headless
   *   engines re-wire — existing values and expression untrack state survive.
   * @param options.validationSchema A Standard Schema run by `validate()`
   *   against the whole model; overrides one attached via `defineSchema`.
   * @param options.languages The language map used to expand translatable
   *   values, overriding `config.languages` (element-level `languages` props
   *   still win). Pass the same map the attaching form receives so the walk and
   *   the mounted elements agree on the model shape.
   * @param seed Initial (partial) data cloned over the schema defaults. A Vue
   *   ref is rejected (dev warn, seed ignored) — pass a plain or reactive
   *   object. Later mutations of the seed are ignored.
   */
  make<const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>>(
    options: {
      schema: S | Ref<S>
      validationSchema?: StandardSchemaV1
      languages?: LanguagesProp
    } & UseModelSubmissionOptions,
    seed?: DeepPartial<SchemaToModel<S>> & Record<string, any>
  ): ModelInstance<S>
  make(
    options: {
      schema: FormSchema | Ref<FormSchema>
      validationSchema?: StandardSchemaV1
      languages?: LanguagesProp
    } & UseModelSubmissionOptions,
    seed?: Record<string, any>
  ): ModelInstance
}
```
