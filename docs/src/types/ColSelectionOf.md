```ts
/**
 * The selection value union for single / multiple modes, resolved from `cols`
 * and widened to primitives. Endpoint / function cols yield `any`.
 */
type ColSelectionOf<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'cols'>> extends infer C
    ? [C] extends [undefined]
      ? any
      : C extends string | ((...args: any) => any)
        ? any
        : C extends readonly (infer E)[]
          ? E extends Record<string, any>
            ? ColValueKeyOf<TEntry> extends infer K
              ? K extends keyof E
                ? WidenScalar<E[K]>
                : any
              : any
            : WidenScalar<E>
          : C extends Record<string, any>
            ? Extract<keyof C, string | number>
            : any
    : any
```
