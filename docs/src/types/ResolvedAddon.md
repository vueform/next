```ts
/**
 * A resolved addon value: display text, or a dynamic component descriptor for
 * schema addons.
 */
type ResolvedAddon =
  | string
  | { component: string; props: Record<string, any> }
  | undefined
```
