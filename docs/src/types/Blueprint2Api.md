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
   * Resolved part attribute overrides.
   */
  parts: TParts

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
   * Merged part-keyed accessibility bindings: the blueprint's semantic base
   * with component-registered bags (`useA11yBindings`) layered on top.
   */
  a11yBindings: MergedBindings<TApi, TSlots, 'a11yBindings', A11yBindings>

  /**
   * Merged part-keyed styling modifiers registered by the component via
   * `useModifiers` (`data-*` state and variant attributes).
   */
  modifiers: MergedBindings<TApi, TSlots, 'modifiers', Modifiers>

  /**
   * The object to hand to `defineExpose`: the raw API plus the resolved
   * `props`, `parts`, `classes`, and `outlets`.
   */
  expose: ClassFactoryApi<TApi, ContextProps<TProps>, TEvents> & {
    props: ContextProps<TProps>
    parts: TParts
    classes: TClasses
    outlets: ComputedRef<TSlots>
    a11yBindings: MergedBindings<TApi, TSlots, 'a11yBindings', A11yBindings>
    modifiers: MergedBindings<TApi, TSlots, 'modifiers', Modifiers>
  }

  /**
   * Registers component-level class definitions.
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

  /**
   * Registers component-level accessibility binding definitions, layered on
   * top of the blueprint's base bags. Bags for the same part shallow-merge;
   * functional entries replace the whole entry.
   *
   * @param defs Binding definition objects or factories.
   */
  useA11yBindings: (
    ...defs: BindingDefsArg<
      ClassFactoryApi<TApi, TProps, TEvents>,
      PropRefsOf<TProps>
    >[]
  ) => void

  /**
   * Registers component-level styling modifier definitions (part-keyed
   * `data-*` bags). Bags for the same part shallow-merge; functional entries
   * replace the whole entry.
   *
   * @param defs Modifier definition objects or factories.
   */
  useModifiers: (
    ...defs: BindingDefsArg<
      ClassFactoryApi<TApi, TProps, TEvents>,
      PropRefsOf<TProps>
    >[]
  ) => void
}
```
