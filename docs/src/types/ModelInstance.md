```ts
/**
 * A standalone form model created by `useModel`: owns the data of a schema
 * outside any form, with unwrapped reactive state (`model`, `dirty`, `empty` —
 * no `.value`) and the full data manipulation API. Passing it to a form's
 * `v-model` makes the form attach it, after which `submit()` and `attached`
 * reflect the form.
 */
type ModelInstance<TSchema = FormSchema> = {
  /**
   * The reactive model object holding all element values.
   */
  readonly model: SchemaToModel<TSchema>

  /**
   * A snapshot of the model at creation time (re-snapshotted by `clean()`),
   * used for dirty checking and reset.
   */
  readonly initialModel: SchemaToModel<TSchema>

  /**
   * Whether the current model differs from the initial model snapshot.
   */
  readonly dirty: boolean

  /**
   * Whether every value in the model is empty (blank or equal to its null
   * value).
   */
  readonly empty: boolean

  /**
   * Whether a form has attached the model (via `v-model` / `useForm`).
   */
  readonly attached: boolean

  /**
   * The schema index: the node tree describing every data-carrying element,
   * built by the schema walk.
   */
  readonly index: SchemaIndex

  /**
   * The full model data, unavailable elements included (same as `model` —
   * mirrors the mounted `data` semantics).
   */
  readonly data: SchemaToModel<TSchema>

  /**
   * The submit payload: the model filtered to available, submittable elements
   * (unavailable and `submit: false` elements are excluded). While attached,
   * the attaching form's payload (its props and transforms apply).
   */
  readonly payload: DeepPartial<SchemaToModel<TSchema>>

  /**
   * The form-level Standard Schema run by `validate()`, if any (explicit
   * `validationSchema` option or one attached via `defineSchema`'s second
   * argument). An attaching form picks it up when it has no own.
   */
  readonly validationSchema: StandardSchemaV1 | undefined

  /**
   * Whether any validated element is currently invalid. While attached, the
   * attaching form's state.
   */
  readonly invalid: boolean

  /**
   * Aggregated error messages from every validated element. While attached,
   * flattened from the attaching form's path-keyed errors (message-bag and
   * server errors included).
   */
  readonly errors: string[]

  /**
   * Structured validation issues from every validated element (and the
   * form-level Standard Schema, if any). While attached, the attaching form's
   * issues.
   */
  readonly issues: Issue[]

  /**
   * Returns the value at the given data path within the model. With no path,
   * returns the whole model object.
   *
   * @param path The dot-notation data path to read.
   */
  get: {
    (): SchemaToModel<TSchema>
    <P extends Paths<TSchema> | (string & {})>(path: P): ModelByPath<TSchema, P>
  }

  /**
   * Sets the value at the given data path within the model.
   *
   * @param path The dot-notation data path to write.
   * @param value The value to assign.
   */
  set: <P extends Paths<TSchema> | (string & {})>(
    path: P,
    value: ModelByPath<TSchema, P>
  ) => void

  /**
   * Updates the model from a (partial) data object: plain objects are
   * deep-merged, arrays and leaves are replaced.
   *
   * @param data The data to merge into the model.
   */
  update: (data: DeepPartial<SchemaToModel<TSchema>>) => void

  /**
   * Updates the model like `update`, but as a user edit: expression-tracked
   * elements covered by the data stop tracking (per their `untrackOn`) — the
   * headless counterpart of typing into a mounted element.
   *
   * @param data The data to merge into the model.
   */
  input: (data: DeepPartial<SchemaToModel<TSchema>>) => void

  /**
   * Loads data into the model (same merge semantics as `update`) and fires the
   * `load` event.
   *
   * @param data The data to load.
   */
  load: (data: DeepPartial<SchemaToModel<TSchema>>) => void

  /**
   * Clears the model to its null values (dynamic container arrays become
   * empty).
   */
  clear: () => void

  /**
   * Resets the model to the initial model snapshot.
   */
  reset: () => void

  /**
   * Marks the model as clean by re-snapshotting the initial model from the
   * current model.
   */
  clean: () => void

  /**
   * Serializes the current model to a JSON string.
   */
  toJSON: () => string

  /**
   * Serializes the current model to a `FormData` instance.
   */
  toFormData: () => FormData

  /**
   * Subscribes a listener to a model event — the data events (`change`,
   * `load`, `reset`, `clear`) or any submission event (`submit`, `success`,
   * `fail`, `serverInvalid`, `cancelled`, `response`, `invalid`, `valid`) —
   * returning an unsubscribe function. While a form has the instance attached,
   * the form mirrors its events into the instance, so these listeners keep
   * firing for form-driven submissions too.
   *
   * @param event The event name.
   * @param cb The listener to register.
   */
  on: <E extends keyof ModelInstanceEvents & string>(
    event: E,
    cb: (...args: ModelInstanceEvents[E]) => any
  ) => () => void

  /**
   * Submits the model. When a form has attached the instance, the form's
   * `submit()` runs (its props and UX apply); otherwise the instance's own
   * submission flow runs against the `endpoint` / `method` / transform options
   * and fires the `onXxx` callbacks.
   */
  submit: () => Promise<SubmitResult | undefined>

  /**
   * Aborts the in-flight submission request, if any — the attaching form's
   * while attached, the instance's own otherwise.
   */
  abort: () => void

  /**
   * Whether a submission is currently running — the attaching form's state
   * while attached, the instance's own flow otherwise.
   */
  readonly submitting: boolean

  /**
   * Whether submit-time validation is currently running — the attaching form's
   * state while attached, the instance's own flow otherwise.
   */
  readonly validating: boolean

  /**
   * The number of times a submission has been started — the attaching form's
   * counter while attached, the instance's own otherwise.
   */
  readonly submits: number

  /**
   * The HTTP response from the most recent submission — the attaching form's
   * while attached, the instance's own otherwise.
   */
  readonly response: HttpResponse | undefined

  /**
   * The result object from the most recent submission attempt — the attaching
   * form's while attached, the instance's own otherwise.
   */
  readonly result: SubmitResult | undefined

  /**
   * Returns the element context at the given element path (e.g.
   * `address.city`, including flat containers' names), or `undefined` when no
   * such element exists. While attached, mounted element contexts resolve
   * first; headlessly, the virtual contexts answer.
   *
   * @param path The dot-notation element path to look up.
   */
  find: (path: string) => StatefulElement | undefined

  /**
   * Validates every available element with rules (per language when
   * translatable), plus the form-level Standard Schema when configured, and
   * resolves with whether everything is valid. While attached, the attaching
   * form's validation runs (mounted semantics apply).
   */
  validate: () => Promise<boolean>

  /**
   * Exposes this model's compiled validation as a Standard Schema.
   */
  toStandardSchema: () => StandardSchemaV1

  /**
   * Stops the instance's watchers and reactive effects (engines, change
   * watcher). The data itself stays readable afterwards.
   */
  destroy: () => void
}
```
