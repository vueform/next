```ts
/**
 * Modules `resolveAddon` needs from the caller's setup context.
 */
interface ResolveAddonModules {
  localize: (value: any) => any
  expression: {
    allowed: (scope: string) => boolean
    resolve: (value: string) => any
  }
}
```
