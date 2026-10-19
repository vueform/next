```ts
/**
 * Classes member shape check: every member must be a `ClassValue` or a
 * function returning one.
 */
type ClassShaped<T> = string extends keyof T
  ? unknown
  : {
      [K in keyof T]: ClassValue | ((...args: any[]) => ClassValue)
    }
```
