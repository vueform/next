import type { ComputedRef } from 'vue'

import { createContext } from '#src/helpers'

import type { GridContext } from './'

/**
 * Context for a grid row, extending the grid context with the row index and
 * column sizes.
 */
export type RowContext = GridContext & {
  /**
   * The zero-based index of this row within the grid.
   */
  row: ComputedRef<number>

  /**
   * The resolved column sizes for each cell in this row.
   */
  cols: ComputedRef<number[]>
}

const [_useRowContext, provideRowContext] =
  createContext<RowContext>('vueform-row')

/**
 * Creates and provides the row context to descendant components.
 *
 * @param options The row context data to provide.
 */
export function createRowContext(options: RowContext): RowContext {
  provideRowContext(options)

  return options
}

/**
 * Injects the nearest ancestor row's context, providing the row index, column
 * sizes, and parent grid state.
 */
export function useRowContext(): RowContext | undefined {
  return _useRowContext()
}
