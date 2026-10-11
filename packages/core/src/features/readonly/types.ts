import type { ConditionalProp } from '#src/modules/conditions'

/**
 * @write
 */
export interface ReadonlyProps<TContext = any> {
  /**
   * Whether the input is read-only.
   */
  readonly?: ConditionalProp<TContext>
}
