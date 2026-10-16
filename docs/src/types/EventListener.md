```ts
/**
 * Registers or removes a callback for a specific event.
 */
type EventListener<TEvents extends Record<string, any[]>> =
  /**
   * Registers or removes a callback for a specific event.
   *
   * @param e The event name.
   * @param callback The handler to register or remove.
   */
  <E extends keyof TEvents>(
    e: E,
    callback: (...args: TEvents[E]) => any
  ) => void
```
