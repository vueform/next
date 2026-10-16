```ts
/**
 * The non-generic bulk of the form factory API, computed and cached once at the
 * widest props. `FormApi<TProps>` overlays only the small schema-dependent
 * slice (`find` / `get` / `set` / model fields) on top — instantiating
 * `ReturnType<typeof blueprint<TProps>>` per concrete props re-derives the
 * entire blueprint return each time.
 */
type FormApiBase = Omit<ReturnType<typeof setup>, keyof FormSchemaApi>
```
