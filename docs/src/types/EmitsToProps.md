```ts
/**
 * Converts an emits interface into Vue-style `onEventName` prop functions.
 */
type EmitsToProps<T> = {
  [K in string & keyof T as `on${Capitalize<K>}`]?: (
    ...args: T[K] extends any[] ? T[K] : any[]
  ) => any
}
```
