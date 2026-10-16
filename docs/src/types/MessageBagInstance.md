```ts
/**
 * A reactive bag of user-facing error and message strings with prepend/append
 * ordering and index-based removal.
 */
type MessageBagInstance = {
  /**
   * Prepended errors and messages storage.
   */
  prepends: {
    errors: string[]
    messages: string[]
  }

  /**
   * Appended errors and messages storage.
   */
  appends: {
    errors: string[]
    messages: string[]
  }

  /**
   * All current errors (prepended + appended).
   */
  errors: ComputedRef<string[]>

  /**
   * All current messages (prepended + appended).
   */
  messages: ComputedRef<string[]>

  /**
   * The first error string, or `undefined` if there are none.
   */
  error: ComputedRef<string>

  /**
   * The first message string, or `undefined` if there are none.
   */
  message: ComputedRef<string>

  /**
   * Adds a string to the front of the errors or messages list.
   *
   * @param msg The string to prepend.
   * @param type Whether to prepend an error or a message.
   * @param keep Whether to keep the message when clearing.
   */
  prepend: (msg: string, type?: 'error' | 'message', keep?: boolean) => void

  /**
   * Adds a string to the end of the errors or messages list.
   *
   * @param msg The string to append.
   * @param type Whether to append an error or a message.
   * @param keep Whether to keep the message when clearing.
   */
  append: (msg: string, type?: 'error' | 'message', keep?: boolean) => void

  /**
   * Removes a specific string from the errors, messages, or both lists.
   *
   * @param msg The string to remove.
   * @param type Which list(s) to search — `'any'` searches both.
   */
  remove: (msg: string, type?: 'error' | 'message' | 'any') => void

  /**
   * Removes an item by index from a specific group and type.
   *
   * @param group Whether to target prepended or appended items.
   * @param type Whether to target errors or messages.
   * @param index The index of the item to remove.
   */
  rm: (
    group: 'prepends' | 'appends',
    type: 'errors' | 'messages',
    index: number
  ) => void

  /**
   * Clears all errors, all messages, or both from the bag.
   *
   * @param type Which list(s) to clear.
   */
  clear: (type?: 'all' | 'errors' | 'messages') => void

  /**
   * Clears only prepended errors, messages, or both.
   *
   * @param type Which prepended list(s) to clear.
   */
  clearPrepended: (type?: 'all' | 'errors' | 'messages') => void

  /**
   * Clears only appended errors, messages, or both.
   *
   * @param type Which appended list(s) to clear.
   */
  clearAppended: (type?: 'all' | 'errors' | 'messages') => void

  /**
   * Returns a plain snapshot of the current prepend/append contents.
   */
  snapshot: () => MessageBagSnapshot

  /**
   * Replaces the current contents with a previously captured snapshot.
   *
   * @param data The snapshot to restore.
   */
  restore: (data: MessageBagSnapshot) => void
}
```
