```ts
/**
 * An optional external listener surface appended to the registered callbacks:
 * `defineEvents` supplies the component's native emit / raw `on*` prop handler
 * through it. Events arrive kebab-cased.
 */
type ExternalEvents = {
  /**
   * Invoked at the end of a synchronous `fire` with the event's arguments.
   *
   * @param event The kebab-cased event name.
   * @param args The event arguments.
   */
  emit?: (event: string, args: any[]) => void

  /**
   * Invoked at the end of `fireAsync`; the raw return value is treated like a
   * registered callback's (thenables awaited, `false` cancels, other defined
   * values become the result).
   *
   * @param event The kebab-cased event name.
   * @param args The event arguments.
   */
  emitAsync?: (event: string, args: any[]) => any

  /**
   * Whether an external handler exists for the event.
   *
   * @param event The kebab-cased event name.
   */
  has?: (event: string) => boolean
}
```
