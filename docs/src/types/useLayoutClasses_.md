```ts
/**
 * Installs the shared element classes a layout component stands for (`root`,
 * `label`, `errors`, …) at the bottom of the host element's class chain,
 * applying `layoutClasses` config overrides per key.
 *
 * @param defs The layout's shared class map.
 */
function useLayoutClasses(defs: Record<string, any>): void
```
