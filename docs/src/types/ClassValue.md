```ts
/**
 * A single CSS class value or an array of class values, including conditional
 * object syntax. Matches Vue's built-in `:class` binding type.
 */
type ClassValue =
  false | null | undefined | string | Record<string, any> | ClassValue[]
```
