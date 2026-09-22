```ts
/**
 * Extracts event names from a props type by finding `on`-prefixed keys and
 * converting them to camelCase and kebab-case.
 */
type EventKeysFromProps<T> = keyof {
  [
    K in keyof T as K extends `on${infer E extends Capitalize<string>}`
      ? CamelCase<E> | KebabCase<E>
      : never
  ]: any
}
```
