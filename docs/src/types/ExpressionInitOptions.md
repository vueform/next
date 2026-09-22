```ts
/**
 * Options for re-initializing a node's expression tracking after a schema
 * rebuild.
 */
type ExpressionInitOptions = {
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
```
