```ts
type OptionalStringParamKeys<T extends readonly string[]> = {
  [I in keyof T]: T[I] extends `${infer K}?`
    ? T[I] extends `${string}$?`
      ? never
      : K
    : never
}[number] &
  string
```
