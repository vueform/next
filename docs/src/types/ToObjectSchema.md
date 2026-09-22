```ts
/**
 * Converts an array schema to its object-keyed equivalent, recursing into
 * group/list children.
 */
type ToObjectSchema<T> = [T] extends [ArraySchemaType]
  ? {
      readonly [
        El in T[number] as El extends { name: infer K extends string }
          ? K
          : never
      ]: El extends {
        type: GroupTypes
        schema: infer S
      }
        ? Omit<El, 'schema'> & { schema: ToObjectSchema<S> }
        : El extends { type: ListTypes }
          ? Omit<El, 'schema'> &
              (El extends { schema: infer S }
                ? { schema: ToObjectSchema<S> }
                : El)
          : El
    }
  : T
```
