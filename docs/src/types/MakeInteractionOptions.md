```ts
/**
 * Configuration for the focusable factory enabling programmatic focus and
 * related behavior.
 */
type MakeInteractionOptions = {
  events: FeatureEvents<{
    blur: [context$: any]
    focus: [context$: any]
  }>
}
```
