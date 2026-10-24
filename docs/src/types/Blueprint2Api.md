```ts
/**
 * Assembled blueprint return. Factory members live under `api` for internal
 * destructuring; `context` is the flat public shape used by `defineExpose` and
 * the `#template` slot.
 */
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
   * Resolved CSS classes for the component.
   */
  classes: TClasses

  /**
   * Merged named outlets: inline template slots combined with prop-based slot
   * component overrides.
   */
  outlets: ComputedRef<TSlots>

  /**
   * Lazy `toRef` proxy over resolved props for reactive destructuring.
   */
  propRefs: PropRefsOf<TProps>

  /**
   * The component's single public context — what the `#template` slot, event
   * handlers (`context$`), `find()`, and `useContext()` receive.
   */
  context: BlueprintContext<TApi, TProps, TEvents, TSlots, TParts, TClasses>

  /**
   * The per-part aggregate the template consumes: for each part key, one bag
   * (or resolver function when the part is functional) merging the part's
   * registered binding definitions and part attribute overrides. Classes are
   * not included — templates bind `:class="classes.x"` alongside.
   */
  bindings: BindingMemberOf<
    TSlots,
    ApiOf<TApi>,
    'bindings',
    BindingsOf<TParts, Record<string, any>>
  >

  /**
   * The object to hand to `defineExpose`: the raw API plus the resolved
   * `props`, `classes`, and `outlets`.
   */
  expose: ClassFactoryApi<TApi, ContextProps<TProps>, TEvents> & {
    props: ContextProps<TProps>
    classes: TClasses
    outlets: ComputedRef<TSlots>
    bindings: BindingMemberOf<
      TSlots,
      ApiOf<TApi>,
      'bindings',
      BindingsOf<TParts, Record<string, any>>
    >
  }

  /**
   * Registers component-level class definitions and returns the `classes`
   * surface (the same object `useBlueprint` returns) — SFCs write
   * `const classes = useClasses({...})`. Resolution is lazy per key, so the
   * returned surface reflects definitions registered later too.
   *
   * @param defs Class definition objects or factories.
   */
  useClasses: (...defs: ClassDefsArg<TClasses>[]) => TClasses

  /**
   * Registers part-keyed binding definitions (a11y, state markers, and any
   * other per-part attributes) — for each part key a resolver function,
   * invoked at the consuming site with the template's call arguments (none
   * for arg-less parts); entries for the same key resolve-then-shallow-merge
   * in registration order — and returns the `bindings` aggregate (the same
   * object `useBlueprint` returns): SFCs write
   * `const bindings = useBindings({...})`.
   *
   * @param defs Part-keyed binding definitions.
   */
  useBindings: (
    ...defs: BindingDefsOf<BindingDefsSurfaceOf<TSlots>>[]
  ) => BindingMemberOf<
    TSlots,
    ApiOf<TApi>,
    'bindings',
    BindingsOf<TParts, Record<string, any>>
  >
}
```
