```ts
/**
 * Creates a new message bag: reactive prepend/append storage for user-facing
 * error and message strings, owned by the caller. Every call returns a fresh,
 * independent bag — elements create one each for their custom errors and
 * messages.
 *
 * Callable anywhere; it has no configuration and no app dependency.
 */
function useMessageBag(): MessageBagInstance
```
