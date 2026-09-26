import type { TProp } from '#core/types'

/**
 * @write
 */
export interface PlaceholderProps<TContext = any> {
  /**
   * The placeholder text displayed when the element is empty.
   */
  placeholder?: TProp<string, TContext>
}
