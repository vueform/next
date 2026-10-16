```ts
type ListenerSignature<K extends string, TArgs extends any[]> =
  /**
   * Registers or removes a callback for the event.
   *
   * @param e The event name.
   * @param callback The handler to register or remove.
   */
  (e: K, callback: (...args: TArgs) => any) => void
```
