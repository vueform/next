```ts
/**
 * Resolved message parameters combining string and element params.
 */
type MessageParams<T extends readonly string[] | true = string[]> =
  T extends readonly string[]
    ? {
        [K in RequiredStringParamKeys<T>]: string
      } & {
        [K in RequiredElementParamKeys<T>]: StatefulElement | undefined
      } & {
        [K in OptionalStringParamKeys<T>]?: string
      } & {
        [K in OptionalElementParamKeys<T>]?: StatefulElement
      } & {
        attribute: string
      }
    : {
        attribute: string
      }
```
