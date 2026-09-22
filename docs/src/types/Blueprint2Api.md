```ts
type Blueprint2Api<
  TApi extends Record<string, any>,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TSlots extends Record<string, any> = Record<string, any>,
> = {
  /**
   * Factory API plus event helpers and the resolved (non-ref) `props` object.
   * For SFC destructuring and class factories — not the public context shape.
   */
  api: ClassFactoryApi<TApi, TProps, TEvents> & ForwardsOf<TApi>

  /**
   * Resolved part attribute overrides.
   */
  parts: TParts

  /**
   * Resolved CSS classes for the component.
   */
  classes: TClasses

  /**
   * Merged named outlets: inline template slots (`useSlots`) combined with
   * prop-based slot component overrides. Uses the blueprint's own merged
   * `outlets` (e.g. from `makeElement`) when available, otherwise the raw
   * `defineSlots` map.
   */
  outlets: ComputedRef<TSlots>

  /**
   * Lazy `toRef` proxy over resolved props for reactive destructuring.
   */
  propRefs: PropRefsOf<TProps>

  /**
   * The component's single public context: the context proxy over the exposed
   * object — ref members read unwrapped and are assignable, `toRefs` / `toRaw`
   * work. Bind it to the `#template` slot and the template outlet as
   * `:context`; it is also what event handlers receive as `context$`, what
   * `find()` returns, and what `useContext()` returns.
   */
  context: BlueprintContext<TApi, TProps, TEvents, TSlots, TParts, TClasses>

  /**
   * The object to hand to `defineExpose`: `toRaw(context)` — the raw API (refs
   * intact) plus the resolved `props`, `parts`, `classes`, and `outlets`. Every
   * public view of the component — `context`, template refs — reads through
   * it.
   */
  expose: ClassFactoryApi<TApi, ContextProps<TProps>, TEvents> & {
    props: ContextProps<TProps>
    parts: TParts
    classes: TClasses
    outlets: ComputedRef<TSlots>
  }

  /**
   * Registers component-level class definitions. Factories are deferred until
   * first class-key access and receive `(api, propRefs)`.
   *
   * @param defs Class definition objects or factories.
   */
  useClasses: (
    ...defs: ClassDefsArg<
      TClasses,
      ClassFactoryApi<TApi, TProps, TEvents>,
      PropRefsOf<TProps>
    >[]
  ) => void
}
```
