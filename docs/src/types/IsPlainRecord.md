```ts
/**
 * Whether `T` is a plain object/record map (not an array, function, or string).
 */
type IsPlainRecord<T> = [T] extends [readonly any[]]
  ? false
  : [T] extends [(...args: any) => any]
    ? false
    : [T] extends [object]
      ? [T] extends [string]
        ? false
        : true
      : false
```
