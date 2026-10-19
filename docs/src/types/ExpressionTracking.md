```ts
/**
 * The tracking surface returned by `makeExpressionTracking(index)`, operating
 * on one schema index.
 */
interface ExpressionTracking {
  /**
   * Whether a component instance's element can be expression-tracked: tracking
   * is active for the schema index and the component definition opted in via
   * `defineOptions({ expressionable: true })`.
   *
   * @param instance The component instance hosting the element.
   */
  trackable: (instance: Parameters<typeof getComponentDef>[0]) => boolean

  /**
   * Activates tracking for the schema index unless it's already active (attached
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
```
