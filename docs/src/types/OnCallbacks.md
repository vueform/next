```ts
/**
 * Maps an emits interface to optional `onXxx` callback members (e.g.
 * `serverInvalid` becomes `onServerInvalid`), each typed with the event's
 * argument tuple.
 */
type OnCallbacks<E> = {
  [K in keyof E & string as `on${Capitalize<K>}`]?: (
    ...args: E[K] extends any[] ? E[K] : any[]
  ) => any
}
```
