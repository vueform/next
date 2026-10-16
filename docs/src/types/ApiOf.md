```ts
/**
 * Resolves the factory API type: `ReturnType` when given a factory function,
 * otherwise the API object type as-is (e.g. from `useBlueprint`).
 */
type ApiOf<T> = T extends (...args: any) => infer R ? R : T
```
