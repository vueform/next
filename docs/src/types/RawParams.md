```ts
/**
 * Raw unprocessed parameter tuple as received from rule parsing.
 */
type RawParams<T extends readonly string[] | true = string[]> =
  T extends readonly string[]
    ? {
        [K in T[number] as K extends `${string}?` ? never : K]: string
      } & {
        [K in T[number] as K extends `${infer V}?` ? V : never]?: string
      }
    : string[]
```
