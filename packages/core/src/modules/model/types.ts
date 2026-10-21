import type { Ref } from 'vue'

import type {
  SubmissionEmits,
  SubmissionProps,
  SubmitResult,
} from '#src/composables/useSubmission'
import type { ConditionalProp } from '#src/modules/conditions'
import type {
  ExpressionNodeState,
  ExpressionTracker,
} from '#src/modules/expression'
import type { HttpResponse } from '#src/modules/http'
import type { Issue, RulesProp, TRulesProp } from '#src/modules/validation'
import type {
  ArraySchema,
  DeepPartial,
  ExactValidatedSchema,
  FormSchema,
  LanguagesProp,
  ModelByPath,
  ObjectSchema,
  Paths,
  SchemaToModel,
  StandardSchemaV1,
  StatefulElement,
} from '#src/types'

import type { makeChildModel, makeRootModel } from './binding'
import type { getModelEvents, hasModelStore } from './internals'
import type { makeModelStore } from './store'
import type { makeMountedNode } from './walk'

/**
 * Configuration options for the model module (`config.$model`).
 */
export interface ModelModuleOptions {}

/**
 * The data events a `useModel` instance fires alongside the submission events.
 * The context argument is the instance's virtual form facade.
 */
export interface ModelDataEmits<TContext = any> {
  /**
   * Fired when any model value changes, with the new and previous snapshots.
   *
   * @param newValue The new model data.
   * @param oldValue The previous model data.
   * @param context$ The instance's virtual form context.
   */
  change: [
    newValue: Record<string, any>,
    oldValue: Record<string, any>,
    context$: TContext,
  ]

  /**
   * Fired when the model is reset to its initial snapshot.
   *
   * @param context$ The instance's virtual form context.
   */
  reset: [context$: TContext]

  /**
   * Fired when the model is cleared to its null values.
   *
   * @param context$ The instance's virtual form context.
   */
  clear: [context$: TContext]

  /**
   * Fired when data is loaded via `load()`.
   *
   * @param value The loaded model value.
   * @param context$ The instance's virtual form context.
   */
  load: [value: any, context$: TContext]
}

/**
 * Every event a `useModel` instance can fire: the shared submission events plus
 * the model data events.
 */
export type ModelInstanceEvents = SubmissionEmits & ModelDataEmits

/**
 * Maps an emits interface to optional `onXxx` callback members (e.g.
 * `serverInvalid` becomes `onServerInvalid`), each typed with the event's
 * argument tuple.
 */
export type OnCallbacks<E> = {
  [K in keyof E & string as `on${Capitalize<K>}`]?: (
    ...args: E[K] extends any[] ? E[K] : any[]
  ) => any
}

/**
 * The `onXxx` callback options accepted by `useModel`, derived from the
 * submission and model data events.
 */
export type UseModelCallbacks = OnCallbacks<ModelInstanceEvents>

/**
 * The submission-related `useModel` options: the shared submission props plus
 * the event callbacks.
 */
export type UseModelSubmissionOptions = SubmissionProps & UseModelCallbacks

/**
 * The model module instance: a stateless factory capturing the app config.
 * `make` builds a standalone form model from a schema — per-form state lives in
 * the returned `ModelInstance`, not the module. The model kit (root / child
 * model creation, the data store, mounted-node creation, and instance branding)
 * is config-free and also available on the fallback surface when the module is
 * not registered.
 */
export interface ModelModule {
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
   * Returns a `useModel` instance's internal event emitter (`undefined` for
   * non-instance values). The form blueprint fires its events into it so
   * instance-level subscriptions keep firing while a form owns submission.
   */
  getModelEvents: typeof getModelEvents

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

/**
 * A node in the schema index: one data-carrying element (leaf or container)
 * with its resolved model metadata. Nodes are created by the schema walk and
 * later claimable by mounted components.
 */
export type ModelNode = {
  /**
   * The element path (e.g. `address.city`), including flat containers' names.
   */
  path: string

  /**
   * The data path within the model. Flat containers share their parent's data
   * path (`''` at the root); their children write to the parent's level.
   */
  dataPath: string

  /**
   * The parent node, if any.
   */
  parent?: ModelNode

  /**
   * Child nodes by name (containers only). Array containers key their rows by
   * index (`'0'`, `'1'`, …) as built from the initial row count.
   */
  children?: Map<string, ModelNode>

  /**
   * Whether the node's data lives merged at the parent's level instead of
   * nested under its own key.
   */
  flat: boolean

  /**
   * Whether the node is an array-like container (e.g. list).
   */
  array: boolean

  /**
   * The schema entry type (e.g. `text`, `group`).
   */
  type?: string

  /**
   * The schema-entry props (with `name` applied). Overridable by mounted
   * elements once claimed.
   */
  props: Record<string, any>

  /**
   * The node's null value (containers: the assembled null tree of their
   * children).
   */
  nullValue: any

  /**
   * Whether the node's value is expanded into a locale-keyed object.
   */
  translatable: boolean

  /**
   * Whether the node's data is included in the submit payload.
   */
  submit: boolean

  /**
   * Whether the node's component opted into `default`-value expression tracking
   * (`defineOptions({ expressionable: true })`). Resolved from the component
   * definition by the walk, or set at claim time for registration-created
   * nodes.
   */
  expressionable?: boolean

  /**
   * Whether the node was created by mounted registration (as opposed to the
   * schema walk) — such nodes carry element facts (props, translatability)
   * filled in at claim time and are removed again on unregistration.
   */
  mounted?: boolean

  /**
   * A human-readable name for validation messages, mirroring the mounted
   * `genericName` chain (`displayName` → `label` → `floating` → `floatLabel` →
   * `ifta` → `placeholder` → `name`) for statically resolvable props.
   */
  genericName: string

  /**
   * Validation rules declared on the schema entry.
   */
  rules?: RulesProp | TRulesProp

  /**
   * Conditions declared on the schema entry.
   */
  conditions?: ConditionalProp

  /**
   * Availability resolved by the conditions engine (attached lazily by the
   * model instance; `undefined` means unconditionally available).
   */
  available?: Ref<boolean>

  /**
   * The mounted component context once claimed (form flip phase).
   */
  el$?: object

  /**
   * Expression-tracking state attached by the expression module while the node
   * has tracked templates (`init` sets it, `release` clears it).
   */
  expression?: ExpressionNodeState
}

/**
 * The result of a schema walk: the node tree plus the default model (with
 * `modelValue` / `default` precedence applied) and the matching null-value
 * tree, all derived from the same traversal.
 */
export type SchemaIndex = {
  /**
   * Top-level nodes by name.
   */
  root: Map<string, ModelNode>

  /**
   * All nodes in the tree, keyed by element path for O(1) lookup.
   */
  nodes: Map<string, ModelNode>

  /**
   * The complete default model derived from the schema.
   */
  model: Record<string, any>

  /**
   * The null-value tree matching the model's shape, used for `clear()` and
   * `empty` checks.
   */
  nullModel: Record<string, any>

  /**
   * Bumped whenever the index's mounted bindings change (a node is claimed or
   * released, or a validation map is attached), so engine aggregates depending
   * on them re-collect.
   */
  version: Ref<number>

  /**
   * The expression tracker attached by the expression module once tracking is
   * activated for this index (one per index, shared by the headless engine and
   * the mounted form).
   */
  expressionTracker?: ExpressionTracker
}

/**
 * A standalone model store returned by `makeModelStore`.
 */
export type ModelStore = ReturnType<typeof import('./store').makeModelStore>

/**
 * The root-level form model returned by `makeRootModel`: the store-backed model
 * refs plus the registration and lifecycle interface owned by the element
 * operating as the form root. `makeChildModel` mirrors the model refs and
 * lifecycle subset of this interface.
 */
export type RootModel = {
  /**
   * The backing model store — the form's own, or the attached `useModel` store
   * when `modelValue` carries one.
   */
  store: ModelStore

  /**
   * Whether the model attached an existing `useModel` store from `modelValue`
   * instead of creating its own.
   */
  attached: boolean

  /**
   * The schema index describing every data-carrying element: the attached
   * instance's index, or an empty one for internally created stores.
   */
  index: SchemaIndex

  /**
   * The attached `useModel` instance's element lookup, `undefined` when the
   * store was created internally.
   */
  modelFind: ((path: string) => StatefulElement | undefined) | undefined

  /**
   * The reactive model object holding all element values.
   */
  model: Ref<Record<string, any>>

  /**
   * A snapshot of the model taken at init, used for change detection.
   */
  lastModel: Ref<any>

  /**
   * A snapshot of the model at creation time (re-snapshotted by `clean()`),
   * used for dirty checking and reset.
   */
  initialModel: Ref<Record<string, any>>

  /**
   * Sets the value at the given data path within the model.
   */
  set: (dataPath: string, value: any) => void

  /**
   * Registers an element's data path in the model, seeding its initial value.
   */
  register: (dataPath: string, initialModel: any) => void

  /**
   * Removes an element's data path from the model. No-op once the form is torn
   * down when the store is attached, so the store's data survives child
   * unregistration.
   */
  unregister: (dataPath: string) => void

  /**
   * Subscribes a callback to writes at the given data path, returning an
   * unsubscribe function.
   */
  subscribe: (dataPath: string, cb: () => void) => () => void

  /**
   * Initializes the model: takes the initial snapshots, emits the initial
   * v-model value, and starts inbound watching (own stores only).
   */
  init: () => void

  /**
   * Tears down the model binding and releases (attached) or destroys (own) the
   * store.
   */
  destroy: () => void
}

/**
 * A standalone form model created by `useModel`: owns the data of a schema
 * outside any form, with unwrapped reactive state (`model`, `dirty`, `empty` —
 * no `.value`) and the full data manipulation API. Passing it to a form's
 * `v-model` makes the form attach it, after which `submit()` and `attached`
 * reflect the form.
 */
export type ModelInstance<TSchema = FormSchema> = {
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
   * `fail`, `clientInvalid`, `serverInvalid`, `cancelled`, `response`,
   * `invalid`, `valid`) —
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

/**
 * Describes how a container element maps its children into the model, as
 * returned by a component's `children` model metadata function.
 */
export type ModelChildren = {
  /**
   * Whether the container's children data lives merged at the parent's level
   * instead of nested under the container's own key (e.g. non-nested groups and
   * grids).
   */
  flat?: boolean

  /**
   * Whether the container's model is an array (e.g. list rows, dynamic matrix
   * rows). Entries are then keyed by stringified indices (`'0'`, `'1'`, …).
   */
  array?: boolean

  /**
   * The unified child schema structure: each key is a child name and each value
   * is the child's schema-entry props (including `type`).
   */
  entries: Record<string, Record<string, any>>
}

/**
 * Model metadata function returning the element's null (empty) value derived
 * from its raw schema-entry props. Implementations must apply their own prop
 * defaults (e.g. checkbox `falseValue ?? false`).
 *
 * @param props The element's raw schema-entry props.
 */
export type ModelMetaNullValue = (props: Record<string, any>) => any

/**
 * Model metadata function returning a container element's unified child
 * structure derived from its raw schema-entry props. Leaf elements omit it.
 *
 * @param props The element's raw schema-entry props.
 */
export type ModelMetaChildren = (
  props: Record<string, any>
) => ModelChildren | undefined
