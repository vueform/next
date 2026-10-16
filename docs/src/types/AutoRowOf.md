```ts
/**
 * The auto-mode row object: keys are the literal col values (they become the
 * row's child element names), each cell typed via the col's custom `schema` or
 * `any`. Endpoint / function cols yield a wide record.
 */
type AutoRowOf<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'cols'>> extends infer C
    ? [C] extends [undefined]
      ? Record<string, any>
      : C extends string | ((...args: any) => any)
        ? Record<string, any>
        : C extends readonly (infer E)[]
          ? Prettify<
              {
                [
                  Col in Extract<E, Record<string, any>> as Extract<
                    Col[ColValueKeyOf<TEntry> & keyof Col],
                    string | number
                  >
                ]: CellModelOf<Col, ColSchemaKeyOf<TEntry>>
              } & {
                [V in Extract<E, string | number>]: any
              }
            >
          : C extends Record<string, any>
            ? { [K in Extract<keyof C, string | number>]: any }
            : Record<string, any>
    : Record<string, any>
```
