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
   * Resolved CSS classes for the component. Keys are created lazily on first
   * access so factories registered via `useClasses` may close over later
   * bindings.
   */
  classes: C & Record<string, any>

  /**
   * Registers one or more class definition objects or factories. Factories are
   * not invoked until a class key is first read (typically during render) and
   * receive `(api, propRefs)`. Definitions for the same key are merged.
   *
   * @param defs Class definition objects or factories.
   */
  useClasses: (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => void

  /**
   * Registers override definitions from outside the component (templates /
   * slots). Per key, the last override that sets the key replaces the
   * component-defined value; keys no override sets keep it.
   *
   * @param defs Class definition objects or factories.
   */
  useClassOverrides: (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => void

  /**
   * Installs the shared base class map at the bottom of the chain (below
   * `reclass`). Single writer — the element layout; a later call replaces the
   * previous map, so a remounting layout stays idempotent.
   *
   * @param defs The base class map.
   */
  setBaseClasses: (defs: Record<string, any>) => void
}
```
