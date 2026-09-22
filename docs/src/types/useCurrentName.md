```ts
/**
 * Returns the registered component name of the current component instance (VDOM
 * or Vapor).
 */
function useCurrentName(): keyof ComponentRegistry<Record<string, any>>
```
