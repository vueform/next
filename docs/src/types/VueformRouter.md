```ts
/**
 * Minimal router interface that vue-router's `Router` satisfies. Allows
 * integration without depending on the `vue-router` package at compile time.
 */
interface VueformRouter {
  currentRoute: Ref<{
    path: string
    query: Record<string, string | null | (string | null)[] | undefined>
    [key: string]: any
  }>
  push: (to: any) => any
  back: () => void
}
```
