```ts
type RequiredStringParamKeys<T extends readonly string[]> = {
  [I in keyof T]: T[I] extends `${string}$?`
    ? never
    : T[I] extends `${string}?`
      ? never
      : T[I] extends `${infer K}$`
        ? K
        : T[I]
}[number] &
  string
```
