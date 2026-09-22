```ts
/**
 * A slot callback with its signature re-declared in method syntax, which is
 * bivariant under `strictFunctionTypes` — narrow-context SFC slots stay
 * assignable to the canonical wide-context ones. Non-function members pass
 * through unchanged.
 */
type BivariantSlot<F> = F extends (...args: infer A) => infer R
  ? { fn(...args: A): R }['fn']
  : F
```
