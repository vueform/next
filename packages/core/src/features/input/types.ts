import type { LooseContext } from '~/types'

/**
 * @write
 */
export interface InputEmits<V = any, TContext = LooseContext> {
  /**
   * Emitted when the input value is changed via the UI by the user.
   *
   * @param value The new value carried by the input.
   * @param e The originating event, when the input came from a native event.
   * @param context$ The component context.
   */
  input: [value: V, e: Event | undefined, context$: TContext]
}
