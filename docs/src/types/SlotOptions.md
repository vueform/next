```ts
/**
 * Component options accepted by `defineSlot`, with the `setup` first argument
 * and Options API `this` narrowed to only the declared props.
 */
type SlotOptions<
  C extends keyof SlotProps,
  S extends keyof SlotProps[C],
  P extends (keyof SlotProps[C][S])[],
> = {
  props?: P
  setup?: (
    props: PropOptions<C, S, P>
  ) => (() => VNodeChild) | Record<string, unknown>
  template?: string
  render?: (this: PropOptions<C, S, P>) => VNodeChild
  components?: Record<string, unknown>
  [key: string]: unknown
} & ThisType<ComponentPublicInstance<PropOptions<C, S, P>>>
```
