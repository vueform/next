```ts
/**
 * A resolved addon value: display text (rendered escaped by the addon
 * component, so it needs no sanitization), or a dynamic component descriptor
 * (`{ component, props }`) for schema addons.
 */
type ResolvedAddon =
  string | { component: string; props: Record<string, any> } | undefined
```
