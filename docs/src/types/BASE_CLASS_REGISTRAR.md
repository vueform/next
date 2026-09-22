```ts
/**
 * Symbol key under which a component's exposed context carries its base class
 * setter. Lets the element layout (`VfLayout`) install the shared wrapper
 * classes (`root`, `label`, `errors`, …) at the bottom of the host element's
 * class chain — below `reclass`, which replaces them, and `classes`, which
 * merges on top — without the setter becoming part of the public context
 * surface.
 */
const BASE_CLASS_REGISTRAR: typeof BASE_CLASS_REGISTRAR
```
