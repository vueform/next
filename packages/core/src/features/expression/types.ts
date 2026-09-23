import type { UntrackOnProp } from '~/types'

/**
 * Props for elements participating in the expression module.
 */
export interface ExpressionProps {
  /**
   * Controls when the element stops tracking user changes.
   */
  untrackOn?: UntrackOnProp
}
