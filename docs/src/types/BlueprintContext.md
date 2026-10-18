```ts
/**
 * Unified public component context: factory API and event helpers at the root,
 * plus resolved `props` / `parts` / `classes` / `outlets`. `$config`,
 * `$locale`, and `$globals` are always present.
 */
type BlueprintContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TModifiers = DefaultContextModifiers<TApi, TSlots>,
  TA11y = DefaultContextA11y<TApi, TSlots>,
> = UnwrapApiRefs<
  // `outlets` is omitted from the api side: blueprints type it wide
  // (`ComputedRef<Record<string, any>>` from `useOutlets`), and intersecting
  // that with the declared `outlets` member below collapses every outlet to
  // `any`.
  Omit<ApiOf<TApi>, 'outlets'> &
    EventsOf<TEvents> & {
      props: ContextProps<TProps>
      parts: Partial<TParts>
      // Declared keys keep their types; any other key resolves too (the
      // classes proxy creates keys lazily), so templates can read keys they
      // registered via `useClasses` or that users supply through `classes`.
      classes: TClasses & Record<string, any>
      outlets: ComputedRef<TSlots>

      /**
       * Part-keyed accessibility bindings: the blueprint's semantic base
       * merged with component-registered bags (`useA11yBindings`).
       */
      a11yBindings: TA11y

      /**
       * Part-keyed styling modifiers (`data-*` state and variant attributes)
       * registered by the component via `useModifiers`.
       */
      modifiers: TModifiers

      /**
       * The resolved Vueform configuration for the injecting app.
       */
      $config: VueformConfig

      /**
       * The locale module instance, or its inert surface when the `locale`
       * module is not registered.
       */
      $locale: LocaleModule

      /**
       * Form-level layout globals derived from the Vueform configuration.
       */
      $globals: VueformGlobals
    }
>
```
