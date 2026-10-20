```ts
/**
 * Creates a typed event system with synchronous and async firing, listener
 * registration, and before/after hooks, wired to the current component's
 * native emit / raw `on*` prop handlers.
 */
function defineEvents<
  T extends Record<string, any>,
  TEvents extends TypeEmitsToOptions<T> = TypeEmitsToOptions<T>,
>(): {
  fire: <E extends keyof TEvents>(e: E, ...args: TEvents[E]) => void
  fireAsync: <E extends keyof TEvents>(
    e: E,
    ...args: TEvents[E]
  ) => Promise<any>
  on: EventListener<TEvents>
  off: EventListener<TEvents>
  onBefore: EventListener<TEvents>
  onAfter: EventListener<TEvents>
  hasListeners: (e: keyof TEvents & string) => boolean
  eventInProgress: Ref<boolean, boolean>
}
```
