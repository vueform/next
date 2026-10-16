```ts
/**
 * Manages a registry of child element instances within a container or form,
 * providing reactive lists and event hooks.
 *
 * @param namespace Optional base path used to compute relative child paths.
 * @param options Optional registry flags.
 */
function useChildren(
  namespace?: MaybeRef<string>,
  options?: UseChildrenOptions
): VueformChildren
```
