```ts
/**
 * Converts a kebab-case string to PascalCase at the type level.
 */
type KebabToPascal<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Capitalize<Head>}${KebabToPascal<Tail>}`
  : Capitalize<S>
```
