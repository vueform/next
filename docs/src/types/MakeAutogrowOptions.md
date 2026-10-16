```ts
/**
 * Configuration for the autogrow factory that auto-resizes a textarea to fit
 * its content.
 */
type MakeAutogrowOptions = {
  props: {
    autogrow: boolean | undefined
  }
  deps: ReturnsOf<
    [[typeof makeInput, ['input']], [typeof makeTData, ['value']]]
  >
}
```
