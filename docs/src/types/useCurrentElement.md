```ts
/**
 * Returns a reactive ref to the current component's root DOM node, refreshed on
 * mount and after updates. Vapor-generic replacement for vueuse's
 * `useCurrentElement`, which reads `instance.proxy.$el` and throws inside Vapor
 * components.
 */
function useCurrentElement<
  T extends Node = HTMLElement,
>(): ComputedRef<T | null>
```
