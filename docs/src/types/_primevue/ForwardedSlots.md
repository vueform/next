```ts
type ForwardedSlots<TSlots, TKeys extends keyof TSlots = keyof TSlots> = {
  [K in TKeys]: TSlots[K]
}
```
