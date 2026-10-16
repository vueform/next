```ts
/**
 * Installs the shared element classes a layout component stands for (`root`,
 * `label`, `errors`, …) at the bottom of the HOST ELEMENT's class chain — the
 * element's `reclass` replaces them, its `classes` merges on top. Called from
 * the layout's setup with its class map inline.
 *
 * The `layoutClasses` config option overrides the map per key: a key it sets
 * replaces that key's layout-provided value, every other key keeps the layout's
 * default. Static values for keys the layout's map defines as functions (e.g.
 * `root`) are wrapped back into functions.
 *
 * @param defs The layout's shared class map.
 */
function useLayoutClasses(defs: Record<string, any>): void
```
