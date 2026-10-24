```ts
/**
 * The events object a factory receives, typed from an event-name-to-argument
 * map.
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
   * Whether any callback is currently registered for the given event.
   *
   * @param e The event name.
   */
  hasListeners?: (e: keyof TEvents & string) => boolean
}
```
