```ts
/**
 * Converts an object schema to its complete model type. Non-nested groups and
 * grids merge their children into the parent level.
 */
type ObjectSchemaToModel<T> = Prettify<
  {
    [
      K in keyof T & string as T[K] extends { type: GroupTypes | GridTypes }
        ? T[K] extends { nested: true }
          ? K
          : never
        : K
    ]: ElementToModel<T[K]>
  } & UnionToIntersection<
    | {
        [K in keyof T & string]: T[K] extends {
          type: GroupTypes
          schema: infer S
        }
          ? T[K] extends { nested: true }
            ? {}
            : [FormSchema] extends [S]
              ? {}
              : string extends keyof S
                ? {}
                : ObjectSchemaToModel<ToObjectSchema<S>>
          : T[K] extends {
                type: GridTypes
                grid: infer G extends GridSchemaLike
              }
            ? T[K] extends { nested: true }
              ? {}
              : ObjectSchemaToModel<GridToSchema<G>>
            : {}
      }[keyof T & string]
    | {}
  >
>
```
