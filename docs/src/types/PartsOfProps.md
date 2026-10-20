```ts
/**
 * Extracts the component's part vocabulary from its props' `parts` prop — the
 * `TParts` generic the bindings surface types resolver arguments from.
 */
type PartsOfProps<TProps> = Partial<
  TProps extends { parts?: PartsProp<infer P> } ? P : Record<string, any>
>
```
