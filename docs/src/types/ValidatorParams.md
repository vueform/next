```ts
/**
 * Resolved validator parameters combining required and optional params.
 */
type ValidatorParams<T extends readonly string[] | true = string[]> =
  T extends readonly string[]
    ? {
        [K in RequiredStringParamKeys<T>]: string
      } & {
        [K in RequiredElementParamKeys<T>]: StatefulElement | undefined
      } & {
        [K in OptionalStringParamKeys<T>]?: string
      } & {
        [K in OptionalElementParamKeys<T>]?: StatefulElement
      }
    : string[]
```
