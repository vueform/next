```ts
/**
 * Options object passed to a feature's inner function.
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
