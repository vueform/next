```ts
/**
 * Resolves the children items from a group. A string key or a function
 * returning children in any ItemsProp format.
 */
type GroupChildren =
  | string[]
  | string
  | ((group: any) => any[] | Record<string, any>)
```
