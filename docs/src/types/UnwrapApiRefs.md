```ts
/**
 * Unwraps a single top-level `Ref` per key without distributing over unions —
 * mirrors what `slotContext` / `ContextOf` produce for the component context.
 */
type UnwrapApiRefs<T> = {
  [K in keyof T]: UnwrapTopLevelRef<T[K]>
}
```
