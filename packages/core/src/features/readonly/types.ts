import type { ConditionalProp } from '#core/modules/conditions'

/**
 * @write
 */
export interface ReadonlyProps<TContext = any> {
  /**
   * Whether the input is read-only.
   */
  readonly?: ConditionalProp<TContext>
}
