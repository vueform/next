import type { ConditionalProp } from '~/modules/conditions'

/**
 * @write
 */
export interface LoadingProps<TContext = any> {
  /**
   * Whether the element is in loading state.
   */
  loading?: ConditionalProp<TContext>
}
