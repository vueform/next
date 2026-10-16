```ts
/**
 * Prop type for specifying when to untrack dirty state, as a single trigger or
 * array of triggers.
 */
type UntrackOnProp = ('input' | 'load' | (string & {}))[]
```
