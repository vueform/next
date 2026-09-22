```ts
/**
 * Picks the listed events from an emit interface and converts them to Vueform
 * event tuples with camelCased keys and `context$` appended as the last
 * argument.
 */
type ForwardedEmits<
  TEmits,
  TKeys extends keyof TEmits = keyof TEmits,
  TContext = LooseContext,
> = {
  [K in TKeys as CamelCase<K & string>]: TEmits[K] extends (
    ...args: infer A
  ) => any
    ? [...A, context$: TContext]
    : [context$: TContext]
}
```
