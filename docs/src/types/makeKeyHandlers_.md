```ts
/**
 * Provides keyboard event handlers that fire keydown, keyup, and keypress
 * events on the element.
 *
 * @param options Factory options containing the event system.
 */
const makeKeyHandlers: (
  config?: unknown
) => (options: MakeKeyHandlersOptions) => {
  handleKeydown: (e: Event) => any
  handleKeyup: (e: Event) => any
  handleKeypress: (e: Event) => any
}
```
