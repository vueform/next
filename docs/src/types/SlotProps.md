```ts
/**
 * Extracts the resolved slot prop types for every registered component, mapping
 * slot names to their prop shapes.
 */
type SlotProps = {
  [K in keyof ComponentRegistry]: ComponentRegistry[K] extends {
    slots: infer T extends Record<string, any>
  }
    ? {
        [TK in keyof T]: T[TK] extends () => any
          ? {}
          : T[TK] extends (props: infer P) => any
            ? P
            : never
      }
    : never
}
```
