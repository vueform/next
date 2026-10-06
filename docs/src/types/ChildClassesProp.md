```ts
/**
 * Prop type for overriding a child component's classes from a parent,
 * supporting contextual functions. Functional class keys additionally accept a
 * function whose last parameter is the component context.
 */
type ChildClassesProp<T extends ComponentNames> =
  ComponentRegistry[T]['classes'] extends infer Classes
    ? MaybeContextual<
        {
          [K in keyof Classes]?: Classes[K] extends infer C
            ? C extends (...args: infer A extends any[]) => any
              ?
                  | ClassValue
                  | ((...args: A) => ClassValue)
                  | ((...args: [...A, context$: any]) => ClassValue)
              : ClassValue | ((context$: any) => ClassValue)
            : never
        } & Record<string, ClassValue | ((...args: any[]) => ClassValue)>
      >
    : never
```
