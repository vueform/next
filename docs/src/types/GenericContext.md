```ts
/**
 * Overlays generic API and props fields onto a component context for
 * `#template` slot typing.
 *
 * Widens `outlets` so the blueprint context (which carries the generic slot
 * map) stays assignable to the slot context type.
 *
 * Wrap the result in an `interface` at the component boundary so registry
 * cycles stay lazy.
 */
type GenericContext<
  TContext extends { props: Record<string, any> },
  TApi extends Record<string, any>,
  TProps extends Record<string, any>,
> = Omit<TContext, keyof TApi | 'props' | 'outlets'> &
  TApi & {
    outlets: Record<string, any>
    props: Omit<TContext['props'], keyof TProps> & TProps
  }
```
