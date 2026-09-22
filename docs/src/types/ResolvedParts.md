```ts
/**
 * The shape returned by `useParts`: the original part type (callable parts
 * remain callable, static parts remain spreadable) plus arbitrary extra keys.
 */
type ResolvedParts<T> = Partial<T>
```
