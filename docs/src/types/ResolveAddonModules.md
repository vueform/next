```ts
/**
 * Modules `resolveAddon` needs from the caller's setup context — gather them
 * via `useLocale()`, `useSecurity()`, and `useExpression()`.
 */
interface ResolveAddonModules {
  localize: (value: any) => any
  expression: {
    allowed: (scope: string) => boolean
    resolve: (value: string) => any
  }
}
```
