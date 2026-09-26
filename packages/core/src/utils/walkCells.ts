import type { ResolvedCell, ResolvedGrid } from '#core/blueprints/grid'

/**
 * Iterates over every cell in a resolved grid, computing rowspan/colspan and
 * padded indices while tracking occupied cells.
 *
 * @param grid The resolved grid structure.
 * @param callback Callback invoked for each cell with positional and span
 *   metadata.
 */
export function walkCells(
  grid: ResolvedGrid,
  callback: ({
    cell,
  }: {
    cell: ResolvedGrid[number][number]
    field: ResolvedCell | null
    rowspan: number
    colspan: number
    rowIndex: number
    colIndex: number
    rowStart: number
    colStart: number
    rowEnd: number
    colEnd: number
    paddedColIndex: number
  }) => void
) {
  const occupied: boolean[][] = []

  grid.forEach((cols, rowIndex) => {
    occupied[rowIndex] = occupied[rowIndex] || []

    let paddedColIndex = 0

    cols.forEach((cell, colIndex) => {
      while (occupied[rowIndex][paddedColIndex]) {
        paddedColIndex++
      }

      let field = null
      let colspan = 1
      let rowspan = 1

      if (Array.isArray(cell)) {
        field = cell[0] === undefined ? null : cell[0]
        colspan = (cell[1] || 1) as number
        rowspan = (cell[2] || 1) as number
      }

      const rowStart = rowIndex
      const colStart = paddedColIndex
      const rowEnd = rowIndex + rowspan - 1
      const colEnd = paddedColIndex + colspan - 1

      callback({
        cell,
        field,
        rowspan,
        colspan,
        rowIndex,
        colIndex,
        paddedColIndex,
        rowStart,
        colStart,
        rowEnd,
        colEnd,
      })

      // Mark all affected cells as occupied
      for (let r = rowIndex; r <= rowEnd; r++) {
        occupied[r] = occupied[r] || []

        for (let c = paddedColIndex; c <= colEnd; c++) {
          occupied[r][c] = true
        }
      }

      paddedColIndex += colspan
    })
  })
}
