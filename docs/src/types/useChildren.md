```ts
/**
 * Manages a registry of child element instances within a container or form,
 * providing reactive lists and event hooks. Derived child lists are lazy
 * computeds — they are not allocated until first read.
 *
 * @param namespace Optional base path used to compute relative child paths.
 * @param options Optional registry flags.
 */
function useChildren(
  namespace?: MaybeRef<string>,
  options?: UseChildrenOptions
): VueformChildren
```
