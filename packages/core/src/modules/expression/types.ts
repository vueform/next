import type { MaybeRef, Ref } from 'vue'

import { type VueformInstance, type VueformConfig } from '#core/helpers'
import type { ModelNode, ModelStore, SchemaIndex } from '#core/modules/model'
import type {
  ExpressionableKeys,
  ExpressionsProp,
  LanguagesProp,
} from '#core/types'
import type { getComponentDef } from '#core/utils'

/**
 * Per-node expression-tracking state, attached to `ModelNode.expression` while
 * the node has tracked templates.
 */
export type ExpressionNodeState = {
  tracking: Ref<boolean>
  untrackOn: string[]
  sources: [string, string][]
  track: () => void
  untrack: () => void
  stopLoad?: () => void
}

/**
 * The per-index expression tracker, attached to `SchemaIndex.expressionTracker`
 * once tracking is activated.
 */
export type ExpressionTracker = {
  init: (
    node: ModelNode,
    el$: () => any,
    initOptions?: ExpressionInitOptions
  ) => void
  release: (node: ModelNode) => void
}

/**
 * The expression module instance, providing expression resolution and path
 * extraction.
 */
export interface ExpressionModule {
  /**
   * Whether the expression module is registered and enabled. `true` for the
   * built-in path adapter and for plugin engines (e.g. expr-eval).
   */
  installed: MaybeRef<boolean>

  /**
   * Resolves an expression string against form data, returning the computed
   * string result. Returns `undefined` when the input expression is
   * `undefined`.
   *
   * @param exp The expression string (e.g. `'{field} > 5'`).
   * @param data The form data object to evaluate against.
   * @param context$ The element context for path/dataPath resolution and SELF.
   */
  resolve: {
    (exp: string, data?: Record<string, any>, context$?: any): string
    (exp: undefined, data?: Record<string, any>, context$?: any): undefined
    (
      exp: string | undefined,
      data?: Record<string, any>,
      context$?: any
    ): string | undefined
  }

  /**
   * Extracts the element paths referenced inside an expression chain string.
   *
   * @param expressionChain The raw expression string to scan.
   * @param path The base element path for resolving relative references.
   */
  usedPaths: (expressionChain: string, path?: string) => string[]

  /**
   * Warns (dev-only, once per app) that an expression engine is required. No-op
   * when the expression module is registered and enabled (built-in path adapter
   * or a plugin engine).
   */
  warn: () => void

  /**
   * Per-node `default`-value expression tracking over a model's schema index:
   * activation, node init / re-init / release, the mounted tracking facade
   * (`isTracking` / `track` / `untrack`), and user-event notifications.
   * Context-free — safe to call anywhere, including headless engines. The inert
   * surface returns a no-op tracking whose `activate` reports `false`.
   *
   * @param index The schema index the tracking operates on. May be `undefined`
   *   (standalone elements without a form) — index-dependent methods no-op.
   */
  makeExpressionTracking: (index?: SchemaIndex) => ExpressionTracking
}

/**
 * Configuration for `makeExpressionTracking(index).activate()`.
 */
export type ExpressionTrackingOptions = {
  /**
   * The model store resolved values are written through.
   */
  store: ModelStore

  /**
   * The (possibly partial) Vueform configuration.
   */
  config: VueformConfig

  /**
   * Resolves the languages used for translatable templates (one tracked
   * template per language). A getter so mounted hosts can hand over their
   * reactive `languages` without eager evaluation.
   */
  languages?: () => LanguagesProp | undefined

  /**
   * Resolves the constants merged under the model in expression resolution data
   * (instance-level `consts` headlessly, the form's resolved `consts` prop when
   * mounted). Callers omit names already registered in
   * `config.$expression.consts`.
   */
  consts?: () => Record<string, any> | undefined

  /**
   * Resolves the host-level expression allow-list (the form's `expressions`
   * prop), consulted between the node's own `expressions` prop and the config
   * trigger list.
   */
  expressions?: () => ExpressionsProp | undefined
}

/**
 * Options for re-initializing a node's expression tracking after a schema
 * rebuild.
 */
export type ExpressionInitOptions = {
  /**
   * Whether tracking should start immediately (writing the resolved value).
   * `false` registers the tracker in the untracked state, preserving a user's
   * earlier untrack across schema rebuilds. Defaults to `true`.
   */
  resume?: boolean

  /**
   * Template sources from the node's previous tracker, used when the current
   * store value is already resolved (no longer a template) and the node's
   * `default` prop offers none — e.g. model-argument templates surviving a
   * schema rebuild.
   */
  prevSources?: [string, string][]
}

/**
 * The tracking surface returned by `makeExpressionTracking(index)`, operating
 * on one schema index.
 */
export interface ExpressionTracking {
  /**
   * Whether a component instance's element can be expression-tracked: tracking
   * is active for the schema index and the component definition opted in via
   * `defineOptions({ expressionable: true })`.
   *
   * @param instance The component instance hosting the element.
   */
  trackable: (instance: Parameters<typeof getComponentDef>[0]) => boolean

  /**
   * Activates tracking for the schema index unless it's already active (adopted
   * `useModel` instances arrive with the activation their engine created).
   * Returns whether tracking is active — `false` when the expression module is
   * not installed or expressions are disabled.
   *
   * @param options The tracking configuration.
   */
  activate: (options: ExpressionTrackingOptions) => boolean

  /**
   * Wires expression tracking for a leaf node (idempotent — already tracked
   * nodes are left untouched). No-op when tracking isn't active for the index.
   * Created effects are owned by the caller's active scope.
   *
   * @param node The index node to track.
   * @param el$ Lazily resolves the element context expressions bind to.
   * @param initOptions Rebuild re-initialization options.
   */
  init: (
    node: ModelNode,
    el$: () => any,
    initOptions?: ExpressionInitOptions
  ) => void

  /**
   * Re-initializes a node's tracking after a schema rebuild changed its facts:
   * releases the current tracker and inits against the new facts, preserving a
   * user's earlier untrack and carrying template sources the store no longer
   * holds (already resolved). Created effects are owned by the caller's active
   * scope.
   *
   * @param node The index node to re-track.
   * @param el$ Lazily resolves the element context expressions bind to.
   */
  reinit: (node: ModelNode, el$: () => any) => void

  /**
   * Stops tracking a node and clears its state (used when mounted-created nodes
   * are removed from the index).
   *
   * @param node The index node to release.
   */
  release: (node: ModelNode) => void

  /**
   * Whether the node's expression is currently tracked and auto-updating the
   * value. `false` for untracked and unknown nodes.
   *
   * @param node The index node to check.
   */
  isTracking: (node: ModelNode | undefined) => boolean

  /**
   * Resumes a node's tracking after an untrack, immediately re-writing the
   * resolved value. No-op for nodes without a tracker.
   *
   * @param node The index node to track.
   */
  track: (node: ModelNode | undefined) => void

  /**
   * Stops a node's tracking, leaving the current value in place. No-op for
   * nodes without a tracker.
   *
   * @param node The index node to untrack.
   */
  untrack: (node: ModelNode | undefined) => void

  /**
   * Notifies a node's tracker about a user-driven event (`input` from real user
   * interaction, `load` from data loading), untracking when the node's
   * `untrackOn` includes it.
   *
   * @param node The index node the event happened on.
   * @param event The event kind.
   */
  notify: (node: ModelNode | undefined, event: 'input' | 'load') => void

  /**
   * Notifies the trackers of every node whose data path is covered by the given
   * data about a user edit — the headless counterpart of per-element `input`
   * events, backing the model instance's `input()` method.
   *
   * @param data The partial model data that was written.
   */
  notifyInputData: (data: Record<string, any>) => void
}

/**
 * The low-level expression engine produced by an `ExpressionAdapter`. Deals
 * with single expressions only — the `{…}` template-chain format, `undefined`
 * passthrough, result normalization, and warning handling are owned by
 * `createExpression` and never reach the engine.
 */
export interface ExpressionEngine {
  /**
   * Evaluates a single expression (the inner content of one `{…}` template)
   * against form data and returns the stringified result. Returns `undefined`
   * when the expression cannot be parsed. Throws when evaluation fails (e.g.
   * transient forward references, self-referencing expressions).
   *
   * @param expression The single expression to evaluate.
   * @param data The form data object to evaluate against.
   * @param context$ The element context for path/dataPath resolution and SELF.
   */
  evaluate: (
    expression: string,
    data?: Record<string, any>,
    context$?: any
  ) => string | undefined

  /**
   * Extracts the element paths referenced by a single expression.
   *
   * @param expression The single expression to scan.
   * @param path The base element path for resolving relative references.
   */
  variables: (expression: string, path?: string) => string[]
}

/**
 * A factory that produces the low-level `ExpressionEngine` from the module
 * options and the owning Vueform instance (adapter functions resolve module
 * doorways like date and locale against it). `createExpression` wraps the
 * engine with everything engine-independent: the `{…}` chain format, escapes,
 * result normalization, the transient-warning queue, `installed`, and `warn`.
 */
export type ExpressionAdapter = (
  options: ExpressionModuleOptions,
  vueform: VueformInstance
) => ExpressionEngine

/**
 * Configuration options for the expression module (`config.$expression`).
 */
export interface ExpressionModuleOptions {
  /**
   * Whether the expression system is enabled. When `false`, `createExpression`
   * returns the inert passthrough surface (`installed: false`) even when an
   * adapter is configured.
   */
  enabled?: boolean

  /**
   * Prop keys that allow expression resolution. When set to an array, only
   * listed keys are resolved. Defaults to all expressionable keys.
   */
  trigger?: ExpressionableKeys[]

  /**
   * Whether to log expression parse/evaluation warnings.
   */
  debug?: boolean

  /**
   * Custom expression functions keyed by name.
   */
  functions?: Record<string, Function>

  /**
   * Custom expression constants keyed by name.
   */
  consts?: Record<string, any>

  /**
   * The expression engine factory (e.g. `exprEvalAdapter`). Defaults to
   * `pathExpressionAdapter`, which resolves simple `{path}` interpolation
   * (`{name}`, `{user.name}`, `{list.0.name}`). Operators, function calls, and
   * other syntax require a plugin adapter.
   */
  adapter?: ExpressionAdapter
}
