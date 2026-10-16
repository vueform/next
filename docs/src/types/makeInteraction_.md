```ts
/**
 * Provides focus state tracking and focus event firing for elements.
 *
 * @param options Factory options containing dependencies and the event system.
 */
const makeInteraction: (
  config?: unknown
) => (options: MakeInteractionOptions) => {
  focused: Ref<boolean, boolean>
  touched: Ref<boolean, boolean>
  visited: Ref<boolean, boolean>
  handleBlur: (e: Event) => void
  handleFocus: (e: Event) => void
}
```
