```ts
/**
 * Maps component names to their accepted slot prop type.
 */
type ComponentsWithSlotsProp = {
  [
    K in keyof ComponentRegistry as keyof ComponentRegistry[K]['props'] extends never
      ? never
      : Extract<keyof ComponentRegistry[K]['props'], 'slots'> extends never
        ? never
        : K
  ]: ComponentRegistry[K]
}
```
