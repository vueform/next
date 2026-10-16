```ts
/**
 * Configuration for the static factory registering a data-less element with
 * its parent container.
 */
type MakeStaticOptions = {
  deps: ReturnsOf<[[typeof makeElement, ['path', 'container']]]>
}
```
