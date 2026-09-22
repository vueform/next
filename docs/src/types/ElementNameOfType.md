```ts
/**
 * Resolves the registered component name for a schema `type` string using the
 * runtime convention `Vf${PascalCase(type)}` (exactly what `useSchema` does),
 * filtered by the registered element names. Unknown type strings resolve to
 * `never`.
 */
type ElementNameOfType<T extends string> = Extract<
  `Vf${KebabToPascal<T>}`,
  ElementNames
>
```
