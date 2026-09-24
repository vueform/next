import type { ConditionalProp } from '@core/modules/conditions'
import type {
  ExpressionNodeState,
  ExpressionTracker,
} from '@core/modules/expression'
import type { Issue, RulesProp, TRulesProp } from '@core/modules/validation'
import type {
  ArraySchema,
  DeepPartial,
  ExactValidatedSchema,
  FormSchema,
  ModelByPath,
  ObjectSchema,
  Paths,
  SchemaToModel,
  StandardSchemaV1,
  StatefulElement,
} from '@core/types'
import type {
  makeChildModel,
  makeMountedNode,
  makeRootModel,
} from './createModel'
import type {
  hasModelStore,
  makeModelStore,
  ModelStoreEvents,
} from './modelStore'
import type { Ref } from 'vue'

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

/**
 * Configuration options for the model module (`config.$model`).
 */
export interface ModelModuleOptions {}

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
export type ModelStore = ReturnType<
  typeof import('./modelStore').makeModelStore
>

/**
 * The root-level form model returned by `makeRootModel`: the store-backed model
 * refs plus the registration and lifecycle interface owned by the element
 * operating as the form root. `makeChildModel` mirrors the model refs and
 * lifecycle subset of this interface.
 */
export type RootModel = {
  /**
   * The backing model store — the form's own, or the adopted `useModel` store
   * when `modelValue` carries one.
   */
  store: ModelStore

  /**
   * Whether the model adopted an existing `useModel` store from `modelValue`
   * instead of creating its own.
   */
  adopted: boolean

  /**
   * The schema index describing every data-carrying element: the adopted
   * instance's index, or an empty one for internally created stores.
   */
  index: SchemaIndex

  /**
   * The adopted `useModel` instance's element lookup, `undefined` when the
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
   * down when the store is adopted, so the store's data survives child
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
   * Tears down the model binding and releases (adopted) or destroys (own) the
   * store.
   */
  destroy: () => void
}

/**
 * A standalone form model created by `useModel`: owns the data of a schema
 * outside any form, with unwrapped reactive state (`model`, `dirty`, `empty` —
 * no `.value`) and the full data manipulation API. Passing it to a form's
 * `v-model` makes the form adopt it, after which `submit()` and `adopted`
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
   * Whether a form has adopted the model (via `v-model` / `useForm`).
   */
  readonly adopted: boolean

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
   * (unavailable and `submit: false` elements are excluded).
   */
  readonly payload: DeepPartial<SchemaToModel<TSchema>>

  /**
   * The form-level Standard Schema run by `validate()`, if any (explicit
   * `validationSchema` option or one attached via `defineSchema`'s second
   * argument). An adopting form picks it up when it has no own.
   */
  readonly validationSchema: StandardSchemaV1 | undefined

  /**
   * Whether any validated element is currently invalid.
   */
  readonly invalid: boolean

  /**
   * Aggregated error messages from every validated element.
   */
  readonly errors: string[]

  /**
   * Structured validation issues from every validated element (and the
   * form-level Standard Schema, if any).
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
   * Subscribes a listener to a model event, returning an unsubscribe function.
   *
   * @param event The event name.
   * @param cb The listener to register.
   */
  on: (event: ModelStoreEvents, cb: (...args: any[]) => void) => () => void

  /**
   * Submits the adopting form. Warns and resolves `undefined` when no form has
   * adopted the model.
   */
  submit: () => Promise<any>

  /**
   * Returns the (virtual) element context at the given element path (e.g.
   * `address.city`, including flat containers' names), or `undefined` when no
   * such element exists.
   *
   * @param path The dot-notation element path to look up.
   */
  find: (path: string) => StatefulElement | undefined

  /**
   * Validates every available element with rules (per language when
   * translatable), plus the form-level Standard Schema when configured, and
   * resolves with whether everything is valid.
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
