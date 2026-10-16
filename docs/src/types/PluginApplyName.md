```ts
/**
 * Valid targets for a plugin's `apply` option, including component names,
 * wildcards, and pattern matchers.
 */
type PluginApplyName =
  | ComponentNames
  | '*element'
  | '*'
  | RegExp
  | (string & {})
```
