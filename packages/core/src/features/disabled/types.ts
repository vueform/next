import type { ConditionalProp } from '#core/modules/conditions'

/**
 * @write
 */
export interface DisabledProps<TContext = any> {
  /**
   * Whether the element is disabled.
   */
  disabled?: ConditionalProp<TContext>
}
