```ts
/**
 * The events object a factory receives, typed from an event-name-to-argument
 * map. Each member is name-guarded so that referencing an event absent from the
 * blueprint's events fails to compile.
 */
type FeatureEvents<TEvents extends Record<string, any[]>> = {
  /**
   * Fires an event with its typed arguments.
   */
  fire: FeatureFire<TEvents>

  /**
   * Fires an event asynchronously, awaiting each callback and short-circuiting
   * when any returns `false`.
   */
  fireAsync: FeatureFire<TEvents>

  /**
   * Subscribes a callback to an event.
   */
  on: FeatureListener<TEvents>

  /**
   * Removes a previously registered event callback.
   */
  off: FeatureListener<TEvents>

  /**
   * Registers a callback that runs before the main event listeners.
   */
  onBefore: FeatureListener<TEvents>

  /**
   * Registers a callback that runs after the main event listeners.
   */
  onAfter: FeatureListener<TEvents>

  /**
   * Whether any callback is currently registered for the given event, either
   * via `on` / `onBefore` / `onAfter` or as a component prop listener.
   */
  hasListeners?: (e: keyof TEvents & string) => boolean
}
```
