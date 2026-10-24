```ts
/**
 * Unified public component context: factory API and event helpers at the root,
 * plus resolved `props` / `parts` / `classes` / `outlets` / `bindings`.
 * `$config`, `$i18n`, and `$globals` are always present. `parts` is the
 * part-override surface (`Parts`), not a bag: overrides render through
 * `bindings.X()` (the `TParts` vocabulary types the resolver arguments), and
 * `parts.x()` answers what the user overrode.
 */
type BlueprintContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TBindings = DefaultContextBindings,
> = UnwrapApiRefs<
  // `outlets` is omitted from the api side: blueprints type it wide
  // (`ComputedRef<Record<string, any>>` from `useOutlets`), and intersecting
  // that with the declared `outlets` member below collapses every outlet to
  // `any`.
  Omit<ApiOf<TApi>, 'outlets'> &
    EventsOf<TEvents> & {
      props: ContextProps<TProps>
      parts: Parts<TParts>
      // Declared keys keep their types; any other key resolves too (the
      // classes proxy creates keys lazily), so templates can read keys they
      // registered via `useClasses` or that users supply through `classes`.
      classes: TClasses & Record<string, any>
      outlets: ComputedRef<TSlots>

      /**
       * The per-part aggregate the template consumes: for each part key, one
       * bag (or resolver function when the part is functional) merging the
       * part's registered binding definitions and part attribute overrides.
       * Classes are not included — templates bind `:class="classes.x"`
       * alongside.
       */
      bindings: BindingMemberOf<
        TSlots,
        ApiOf<TApi>,
        'bindings',
        BindingsOf<TParts, TBindings>
      >

      /**
       * Type-only channel carrying the component's bindings definition
       * surface (`VfXBindings`), so `useBlueprint` can type the `useBindings`
       * registrar it returns to the SFC. Function-typed so the channel is
       * CONTRAVARIANT: the loosely-instantiated SFC-side context stays
       * assignable to the concrete `VfXContext`. Never assigned at runtime.
       *
       * @internal
       */
      readonly __bindingDefs?: (defs: TBindings) => void

      /**
       * The resolved Vueform configuration for the injecting app.
       */
      $config: VueformConfig

      /**
       * The i18n module instance, or its inert surface when the `i18n`
       * module is not registered.
       */
      $i18n: I18nModule

      /**
       * Form-level layout globals derived from the Vueform configuration.
       */
      $globals: VueformGlobals
    }
>
```
