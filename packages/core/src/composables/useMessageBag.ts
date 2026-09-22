import { computed, reactive, ref, type ComputedRef } from 'vue'

/**
 * A reactive bag of user-facing error and message strings with prepend/append
 * ordering and index-based removal.
 */
export type MessageBagInstance = {
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

/**
 * A serializable snapshot of a message bag's prepend/append contents.
 */
export type MessageBagSnapshot = {
  /**
   * Snapshot of prepended errors and messages.
   */
  prepends: { errors: string[]; messages: string[] }

  /**
   * Snapshot of appended errors and messages.
   */
  appends: { errors: string[]; messages: string[] }
}

/**
 * Creates a new message bag: reactive prepend/append storage for user-facing
 * error and message strings, owned by the caller. Every call returns a fresh,
 * independent bag — elements create one each for their custom errors and
 * messages.
 *
 * Callable anywhere; it has no configuration and no app dependency.
 *
 * @private
 */
export function useMessageBag(): MessageBagInstance {
  const prepends = reactive({
    errors: [] as string[],
    messages: [] as string[],
  })
  const appends = reactive({
    errors: [] as string[],
    messages: [] as string[],
  })

  const keepers = ref<string[]>([])

  const errors = computed(() => [...prepends.errors, ...appends.errors])

  const messages = computed(() => [...prepends.messages, ...appends.messages])

  const error = computed(() => errors.value[0])
  const message = computed(() => messages.value[0])

  const prepend = (
    msg: string,
    type: 'error' | 'message' = 'error',
    keep: boolean = false
  ) => {
    prepends[type === 'error' ? 'errors' : 'messages'].unshift(msg)
    if (keep && !keepers.value.includes(msg)) keepers.value.push(msg)
  }

  const append = (
    msg: string,
    type: 'error' | 'message' = 'error',
    keep: boolean = false
  ) => {
    appends[type === 'error' ? 'errors' : 'messages'].push(msg)
    if (keep && !keepers.value.includes(msg)) keepers.value.push(msg)
  }

  const remove = (msg: string, type: 'error' | 'message' | 'any' = 'any') => {
    if (['any', 'error'].indexOf(type) !== -1) {
      prepends.errors.forEach((error, index) => {
        if (error === msg) {
          rm('prepends', 'errors', index)
        }
      })
      appends.errors.forEach((error, index) => {
        if (error === msg) {
          rm('appends', 'errors', index)
        }
      })
    }

    if (['any', 'message'].indexOf(type) !== -1) {
      prepends.messages.forEach((error, index) => {
        if (error === msg) {
          rm('prepends', 'messages', index)
        }
      })
      appends.messages.forEach((error, index) => {
        if (error === msg) {
          rm('appends', 'messages', index)
        }
      })
    }
  }

  const rm = (
    group: 'prepends' | 'appends',
    type: 'errors' | 'messages',
    index: number
  ) => {
    group === 'prepends'
      ? prepends[type].splice(index, 1)
      : appends[type].splice(index, 1)
  }

  const clear = (type: 'all' | 'errors' | 'messages' = 'all') => {
    const messages =
      type === 'all'
        ? [
            ...prepends.errors,
            ...prepends.messages,
            ...appends.errors,
            ...appends.messages,
          ]
        : [...prepends[type], ...appends[type]]

    messages
      .filter((msg) => !keepers.value.includes(msg))
      .forEach((msg) => remove(msg, 'any'))
  }

  const clearPrepended = (type: 'all' | 'errors' | 'messages' = 'all') => {
    const messages =
      type === 'all'
        ? [...prepends.errors, ...prepends.messages]
        : prepends[type]

    messages
      .filter((msg) => !keepers.value.includes(msg))
      .forEach((msg) => remove(msg, 'any'))
  }

  const clearAppended = (type: 'all' | 'errors' | 'messages' = 'all') => {
    const messages =
      type === 'all' ? [...appends.errors, ...appends.messages] : appends[type]

    messages
      .filter((msg) => !keepers.value.includes(msg))
      .forEach((msg) => remove(msg, 'any'))
  }

  const snapshot = (): MessageBagSnapshot => ({
    prepends: {
      errors: [...prepends.errors],
      messages: [...prepends.messages],
    },
    appends: {
      errors: [...appends.errors],
      messages: [...appends.messages],
    },
  })

  const restore = (data: MessageBagSnapshot) => {
    prepends.errors.splice(0)
    prepends.errors.push(...data.prepends.errors)
    prepends.messages.splice(0)
    prepends.messages.push(...data.prepends.messages)
    appends.errors.splice(0)
    appends.errors.push(...data.appends.errors)
    appends.messages.splice(0)
    appends.messages.push(...data.appends.messages)
  }

  return {
    prepends,
    appends,
    errors,
    messages,
    error,
    message,
    prepend,
    append,
    remove,
    rm,
    clear,
    clearPrepended,
    clearAppended,
    snapshot,
    restore,
  }
}
