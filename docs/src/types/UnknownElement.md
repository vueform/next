```ts
/**
 * Catch-all element context when the concrete element type is unknown (e.g.
 * unknown `find()` paths).
 *
 * Intentionally not `ContextOf<ElementNames>`: that union instantiates every
 * registered element's context graph and dominates typecheck time. Call sites
 * that know the element should use `ContextOf<'Vf…'>` instead.
 */
type UnknownElement = any
```
