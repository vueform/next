```ts
/**
 * Registers or removes a callback for a specific event.
 */
type EventListener<TEvents extends Record<string, any[]>> = <
  E extends keyof TEvents,
>(
  e: E,
  callback: (...args: TEvents[E]) => any
) => void
```
