```ts
/**
 * Options object passed to a feature's inner function. Prefer a concrete
 * `MakeXOptions` (or this type with concrete type args) unless the return type
 * depends on props/deps generics (e.g. `MakeItemsReturn<P>`).
 */
type FeatureContext<
  Props extends Record<string, any> = Record<string, any>,
  Deps extends Record<string, any> = {},
  Events = unknown,
> = {
  props: Props
  deps: Deps
  events: Events
}
```
