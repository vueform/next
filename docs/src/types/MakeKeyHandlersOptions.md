```ts
/**
 * Configuration for the key handlers factory wiring keyboard event handlers.
 */
type MakeKeyHandlersOptions = {
  events: FeatureEvents<{
    keydown: [event: Event, context$: LooseContext]
    keyup: [event: Event, context$: LooseContext]
    keypress: [event: Event, context$: LooseContext]
  }>
}
```
