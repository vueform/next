```ts
type ModelInternals = {
  store: ModelStore
  engine: ReturnType<typeof makeEngine>
  events: ReturnType<typeof createEvents>
}
```
