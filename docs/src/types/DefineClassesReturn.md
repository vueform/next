```ts
/**
 * Return type of `defineClasses`: the lazy classes proxy plus a `useClasses`
 * registrar for deferred component-level class definitions.
 */
type DefineClassesReturn<
  C extends Record<string, any>,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = {
  /**
   * Resolved CSS classes for the component, with keys created lazily on first
   * access.
   */
  classes: C & Record<string, any>

  /**
   * Registers one or more class definition objects or factories. Definitions
   * for the same key are merged.
   *
   * @param defs Class definition objects or factories.
   */
  useClasses: (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => void

  /**
   * Registers override definitions from outside the component (templates /
   * slots). Per key, the last override that sets the key replaces the
   * component-defined value.
   *
   * @param defs Class definition objects or factories.
   */
  useClassOverrides: (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => void

  /**
   * Installs the shared base class map at the bottom of the class chain.
   *
   * @param defs The base class map.
   */
  setBaseClasses: (defs: Record<string, any>) => void
}
```
