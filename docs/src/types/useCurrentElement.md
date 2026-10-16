```ts
/**
 * Returns a reactive ref to the current component's root DOM node, refreshed on
 * mount and after updates.
 */
function useCurrentElement<
  T extends Node = HTMLElement,
>(): ComputedRef<T | null>
```
