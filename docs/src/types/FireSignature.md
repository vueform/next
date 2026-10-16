```ts
type FireSignature<K extends string, TArgs extends any[]> =
  /**
   * Fires the event with its typed arguments.
   *
   * @param e The event name.
   * @param args The event arguments forwarded to each callback.
   */
  (e: K, ...args: TArgs) => any
```
