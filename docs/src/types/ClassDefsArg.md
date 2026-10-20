```ts
/**
 * A part-keyed class definition registered via `useClasses`: for each class
 * key a `ClassValue`, a zero-argument resolver (resolved inside the key's own
 * computed — the key stays static), or a parameterized resolver (the key is
 * functional and templates call `classes.key(args)`). There are deliberately
 * NO whole-surface factories: entries close over the component scope, so
 * registering a definition performs no reactive reads and keys never inherit
 * one another's dependencies.
 */
type ClassDefsArg<C> = {
  [K in keyof C]?: C[K] extends (...args: any[]) => infer R
    ? // Functional keys also accept a plain static contribution: it merges
      // into the callable chain (e.g. a component's static `root` class under
      // the layout's functional base).
      C[K] | R
    : C[K] | (() => C[K])
}
```
