import type { UntrackOnProp } from '~/types'

/**
 * Props for elements that track user input state changes.
 */
export interface ExpressionProps {
  /**
   * Controls when the element stops tracking user changes.
   */
  untrackOn?: UntrackOnProp
}
