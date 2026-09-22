```ts
/**
 * Unified public component context: factory API and event helpers at the root,
 * plus resolved `props` / `parts` / `classes` / `outlets`.
 *
 * This is the single shape shared by:
 *
 * - event-handler `context$` (proxy over `instance.exposed`)
 * - `defineExpose` / `#template` slot payload
 *
 * `$config`, `$locale`, and `$globals` are always present — injected by
 * `createComponentContext` for every component, not only those that expose them
 * from a factory.
 *
 * `TApi` may be a factory (`typeof setup<…>`) or an already-built API object
 * type — factories are resolved via `ReturnType`. `TEvents` may be an emit map
 * (`SelectEmits`) or a `defineEvents()` return — emit maps are wrapped with
 * `DefineEvents`. `TParts` is always exposed as `Partial<TParts>`. Top-level
 * refs are unwrapped via `UnwrapApiRefs`.
 */
type BlueprintContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
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
