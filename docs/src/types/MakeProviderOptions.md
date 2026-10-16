```ts
/**
 * Configuration for the provider factory wiring container context for child
 * elements.
 */
type MakeProviderOptions = {
  deps: ReturnsOf<[[typeof makeElement, ['container', 'children']]]>
}
```
