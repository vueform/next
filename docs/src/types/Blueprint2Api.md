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
   * handlers (`context$`), `find()`, and `useTemplateContext()` receive.
   */
  context: BlueprintContext<TApi, TProps, TEvents, TSlots, TParts, TClasses>

  /**
   * Merged part-keyed accessibility bindings registered by the component via
   * `useA11y` (usually through a canonical `#src/a11y` pattern).
   */
  a11yBindings: MergedBindings<TApi, TSlots, 'a11yBindings', A11yBindings>

  /**
   * Merged part-keyed styling modifiers registered by the component via
   * `useModifiers` (`data-*` state and variant attributes).
   */
  modifiers: MergedBindings<TApi, TSlots, 'modifiers', Modifiers>

  /**
   * The per-part aggregate the template consumes: for each part key, one bag
   * (or resolver function) merging the part's modifiers, a11y bindings, part
   * attribute overrides, and resolved classes (as `class`).
   */
  bindings: BindingMemberOf<
    TSlots,
    ApiOf<TApi>,
    'bindings',
    BindingsOf<TParts, TClasses, Modifiers, A11yBindings>
  >

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
    bindings: BindingMemberOf<
      TSlots,
      ApiOf<TApi>,
      'bindings',
      BindingsOf<TParts, TClasses, Modifiers, A11yBindings>
    >
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
   * Registers component-level accessibility binding definitions (part-keyed
   * `aria-*`/role bags), usually by invoking a canonical pattern from
   * `#src/a11y`. Bags for the same part shallow-merge; functional entries
   * replace the whole entry.
   *
   * @param defs Binding definition objects or factories.
   */
  useA11y: (
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
