```ts
/**
 * Creates a typed event system with synchronous and async firing, listener
 * registration, and before/after hooks — component-free. `defineEvents` wraps
 * it with the component's native emit; headless consumers (e.g. `useModel`)
 * use it directly.
 *
 * @param external Optional external listener surface (native emit / raw prop
 *   handlers) appended after the registered callbacks.
 */
function createEvents<
  T extends Record<string, any>,
  TEvents extends TypeEmitsToOptions<T> = TypeEmitsToOptions<T>,
>(
  external?: ExternalEvents
): {
  /**
   * Fires an event synchronously, invoking before, listener, and after
   * callbacks in order, then the external handler.
   *
   * @param e The event name.
   * @param args The event arguments forwarded to each callback.
   */
  fire: <E extends keyof TEvents>(e: E, ...args: TEvents[E]) => void

  /**
   * Fires an event asynchronously, awaiting each callback and short-circuiting
   * when any returns `false`.
   *
   * @param e The event name.
   * @param args The event arguments forwarded to each callback.
   */
  fireAsync: <E extends keyof TEvents>(
    e: E,
    ...args: TEvents[E]
  ) => Promise<any>

  /**
   * Subscribes a callback to a specific event.
   *
   * @param e The event name.
   * @param callback The handler to invoke when the event fires.
   */
  on: EventListener<TEvents>

  /**
   * Removes a previously registered event callback.
   *
   * @param e The event name.
   * @param callback The handler to remove. Omit to remove all listeners for the
   *   event.
   */
  off: EventListener<TEvents>

  /**
   * Whether any callback is currently registered for the given event.
   *
   * @param e The event name.
   */
  hasListeners: (e: keyof TEvents & string) => boolean

  /**
   * Whether an async event is currently being processed.
   */
  eventInProgress: Ref<boolean, boolean>
}
```
