```ts
type OptionalElementParamKeys<T extends readonly string[]> = {
  [I in keyof T]: T[I] extends `${infer K}$?` ? `${K}$` : never
}[number] &
  string
```
