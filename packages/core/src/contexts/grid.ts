import type { Ref } from 'vue'

import type { GridCell, InlineGrid } from '#src/blueprints/grid'
import { createContext } from '#src/helpers'
import type { AlignProp, ValignProp } from '#src/types'

/**
 * Context for a grid layout containing inline grid state, cells, and a refresh
 * callback.
 */
export type GridContext = {
  /**
   * The reactive inline grid state holding column and row definitions.
   */
  inlineGrid: Ref<InlineGrid>

  /**
   * The computed list of resolved grid cells.
   */
  cells: Ref<GridCell[]>

  /**
   * Whether the first row of the grid uses header styling.
   */
  colHeaders: Ref<boolean>

  /**
   * Whether the first column of the grid uses header styling.
   */
  rowHeaders: Ref<boolean>

  /**
   * The grid-level horizontal alignment for cell content.
   */
  align: Ref<AlignProp>

  /**
   * The grid-level vertical alignment for cell content.
   */
  valign: Ref<ValignProp>

  /**
   * Recalculates the inline grid layout.
   */
  refreshInlineGrid: () => void
}

const [_useGridContext, provideGridContext] =
  createContext<GridContext>('vueform-grid')

/**
 * Creates and provides the grid context to descendant components.
 *
 * @param options The grid context data to provide.
 */
export function createGridContext(options: GridContext): GridContext {
  provideGridContext(options)

  return options
}

/**
 * Injects the nearest ancestor grid's context, providing access to inline grid
 * state, cells, and layout refresh.
 */
export function useGridContext(): GridContext | undefined {
  return _useGridContext()
}
