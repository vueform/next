import type { LooseContext } from '@core/types'

/**
 * @write
 */
export interface KeyEmits<TContext = LooseContext> {
  /**
   * Emitted on keydown, passes the keyboard event and component context.
   *
   * @param event The keyboard event.
   * @param context$ The element's component context.
   */
  keydown: [event: Event, context$: TContext]

  /**
   * Emitted on keyup, passes the keyboard event and component context.
   *
   * @param event The keyboard event.
   * @param context$ The element's component context.
   */
  keyup: [event: Event, context$: TContext]

  /**
   * Emitted on keypress, passes the keyboard event and component context.
   *
   * @param event The keyboard event.
   * @param context$ The element's component context.
   */
  keypress: [event: Event, context$: TContext]
}
