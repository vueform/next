import type { ConditionalProp } from '~/modules/conditions'

/**
 * @write
 */
export interface ReadonlyProps<TContext = any> {
  /**
   * Whether the input is read-only.
   */
  readonly?: ConditionalProp<TContext>
}
