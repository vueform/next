```ts
/**
 * A serializable snapshot of a message bag's prepend/append contents.
 */
type MessageBagSnapshot = {
  /**
   * Snapshot of prepended errors and messages.
   */
  prepends: { errors: string[]; messages: string[] }

  /**
   * Snapshot of appended errors and messages.
   */
  appends: { errors: string[]; messages: string[] }
}
```
