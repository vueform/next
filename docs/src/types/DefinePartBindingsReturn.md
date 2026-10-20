```ts
/**
 * Return type of `definePartBindings`: the registrar plus the structural
 * accessors the aggregate resolves through.
 */
type DefinePartBindingsReturn = {
  /**
   * Registers one or more part-keyed binding definitions.
   *
   * @param defs Part-keyed binding definitions.
   */
  useBindings: (...defs: BindingDefsInput[]) => void

  /**
   * The registered entries for a part key, untouched, in registration order.
   */
  entriesOf: (key: string) => BindingEntry[]

  /**
   * Every part key any registered definition mentions.
   */
  keysOf: () => string[]
}
```
