```ts
/**
 * Kebab-cases an identifier: a `-` is inserted before every uppercase
 * character, which is then lowered (`updateModelValue` →
 * `update-model-value`).
 */
type KebabCase<S extends string> = S extends `${infer H}${infer T}`
  ? T extends Uncapitalize<T>
    ? `${Uncapitalize<H>}${KebabCase<T>}`
    : `${Uncapitalize<H>}-${KebabCase<T>}`
  : S
```
