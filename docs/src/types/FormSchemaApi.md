```ts
/**
 * The schema-driven slice of the form factory API. When `TSchema` is a concrete
 * schema (e.g. from `defineSchema` via the `schema` prop), paths, element
 * contexts, and model shapes are all derived from it; with the wide
 * `FormSchema` every member falls back to its loose form.
 */
type FormSchemaApi<TSchema = FormSchema> = {
  /**
   * Finds a registered element by its path or data path. Known schema paths are
   * suggested and return the element's schema-narrowed context; unknown paths
   * are accepted and return an untyped element.
   *
   * @param path The element path or data path to look up.
   */
  find: <P extends Paths<TSchema> | (string & {})>(
    path: P
  ) => ElementByPath<TSchema, P> | undefined

  /**
   * Returns the value of the element at the given path. When the path is
   * suffixed with `@propName` it returns that property of the element's context
   * instead of its model value.
   *
   * @param path The element path, optionally suffixed with `@propName`.
   */
  get: <P extends Paths<TSchema> | (string & {})>(
    path: P
  ) => GetResult<TSchema, P>

  /**
   * Sets the value of the element at the given path, falling back to writing
   * the root model directly when no element is registered there.
   *
   * @param path The element path to set.
   * @param value The value to assign.
   */
  set: <P extends Paths<TSchema> | (string & {})>(
    path: P,
    value: ModelByPath<TSchema, P>
  ) => void

  /**
   * The root reactive model object holding all form element values.
   */
  model: Ref<SchemaToModel<TSchema>>

  /**
   * The full model data — an alias of `model`.
   */
  data: Ref<SchemaToModel<TSchema>>

  /**
   * A snapshot of the model at mounted time, used for dirty checking and reset.
   */
  initialModel: Ref<SchemaToModel<TSchema>>

  /**
   * The aggregated submission payload derived from all child elements.
   */
  payload: ComputedRef<SchemaToModel<TSchema>>

  /**
   * Updates form element values programmatically from a (partial) data object.
   *
   * @param data The data to load into the form.
   */
  update: (data: DeepPartial<SchemaToModel<TSchema>>) => void
}
```
