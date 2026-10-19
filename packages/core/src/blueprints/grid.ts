import { computed, ref, toRef, type Component } from 'vue'

import {
  useConfig,
  useContainerProvider,
  useFeatures,
  useRootDom,
  useSecurity,
  useComponentFactory,
} from '#src/composables'
import { createGridContext } from '#src/contexts'
import {
  makeElement,
  makeDisabled,
  makeData,
  makeLayout,
  type DisabledProps,
  type ModelApi,
  type ModelProps,
  type BaseElementEmits,
  type BaseElementProps,
  type BaseContainerElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementA11y,
  type BaseElementModifiers,
  type BaseElementSlots,
  type ContainerProps,
  type ValidationProps,
  type LayoutProps,
  type ModelEmits,
  type ObjectModel,
  type ValidationEmits,
} from '#src/features'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type {
  GridSchema,
  AlignProp,
  ValignProp,
  LooseRequired,
  GridCellAttrs,
  GridCellContent,
  GridCellSchema,
  NamedElementSchema,
} from '#src/types'
import { walkCells } from '#src/utils'

/**
 * A resolved column tuple: [cell, colspan, rowspan, alignment].
 */
type ResolvedCol = [ResolvedCell, number, number, AlignProp]

/**
 * Props for the grid element blueprint.
 */
export interface GridProps<
  T extends string = 'grid',
  S = GridSlots,
  P = GridParts,
  C = GridClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ContainerProps,
    ValidationProps<TContext>,
    ModelProps<ObjectModel, TContext>,
    DisabledProps<TContext> {
  /**
   * The grid schema defining cell contents and layout.
   */
  grid?: GridSchema

  /**
   * Whether the grid nests its data under its own key in the form model.
   */
  nested?: boolean

  /**
   * The number of columns in the grid.
   */
  cols?: number

  /**
   * The number of rows in the grid.
   */
  rows?: number

  /**
   * Horizontal alignment of grid cell content.
   */
  align?: AlignProp

  /**
   * Vertical alignment of grid cell content.
   */
  valign?: ValignProp

  /**
   * Custom widths for each grid column.
   */
  widths?: (null | string | number)[]

  /**
   * Minimum width of the grid before it becomes scrollable.
   */
  minWidth?: string | number

  /**
   * Maximum width of the grid.
   */
  maxWidth?: string | number

  /**
   * Whether the grid is horizontally scrollable when content overflows.
   */
  scrollable?: boolean

  /**
   * Whether to display column headers.
   */
  colHeaders?: boolean

  /**
   * Whether to display row headers.
   */
  rowHeaders?: boolean

  /**
   * Whether the grid uses a tabular visual style with borders and headers.
   */
  tabular?: boolean

  /**
   * Whether column header text can wrap.
   */
  wrapColHeaders?: boolean

  /**
   * Whether row header text can wrap.
   */
  wrapRowHeaders?: boolean
}

/**
 * Events emitted by the grid element.
 */
export interface GridEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ObjectModel, TContext>,
    ValidationEmits<TContext> {}

/**
 * Slots for the grid element.
 */
export interface GridSlots<TContext = any> extends BaseElementSlots<TContext> {}

/**
 * Parts for the grid element.
 */
export interface GridParts extends BaseContainerElementParts {}

/**
 * Classes for the grid element.
 */
export interface GridClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the grid element blueprint.
 */
export interface GridModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the grid element blueprint.
 */
export interface GridA11y extends BaseElementA11y {}

/**
 * Augmentable public API surface for grid-based components.
 */
export interface GridExpose extends BaseElementExpose, GridApi {}

/**
 * Factory API produced by the grid blueprint's `blueprint` function, optionally
 * parameterized by concrete props (e.g. `GridApi<EntryProps>` with a
 * grid-schema-narrowed `modelValue`). Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites (Expose / Context layers, extensions).
 */
export type GridApi<TProps extends GridProps<string> = GridProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * A resolved grid cell: what it mounts (`key` / `component` / `props`), its
 * span, and its alignment.
 */
export type ResolvedCell = {
  /**
   * Stable key for the rendered cell: the element's `name` for schema cells,
   * the `row-col` position otherwise.
   */
  key: string

  /**
   * What the cell mounts: the resolved element component for schema cells (an
   * explicit `component` allowed by `$security.allowComponents`, or the `Vf*`
   * name derived from `type`), the content component for string cells (plain
   * text escaped; HTML via `$security.allowHtml: ['grid']`, sanitized after
   * expression resolution), or `null` for an empty cell.
   */
  component: string | Component | null

  /**
   * The props bound to `component`: the sanitized element schema for schema
   * cells, empty otherwise.
   */
  props: Record<string, any>

  /**
   * Number of columns this cell spans.
   */
  colspan: number

  /**
   * Number of rows this cell spans.
   */
  rowspan: number

  /**
   * Horizontal text alignment for the cell.
   */
  align: AlignProp

  /**
   * Vertical alignment for the cell.
   */
  valign: ValignProp

  /**
   * Additional HTML attributes applied to the cell element.
   */
  attrs: GridCellAttrs

  /**
   * The cell's row index in the grid schema.
   */
  row: number

  /**
   * The cell's column index in the grid schema.
   */
  col: number
}

/**
 * A fully positioned grid cell with row/col coordinates and optional CSS
 * grid-area style.
 */
export type GridCell = ResolvedCell & {
  /**
   * The cell's row index in the resolved grid.
   */
  row: number

  /**
   * The cell's column index in the resolved grid.
   */
  col: number

  /**
   * The CSS grid row start position (0-based).
   */
  rowStart: number

  /**
   * The CSS grid column start position (0-based).
   */
  colStart: number

  /**
   * The CSS grid row end position (0-based).
   */
  rowEnd: number

  /**
   * The CSS grid column end position (0-based).
   */
  colEnd: number

  /**
   * Whether this cell is a column header (first row when colHeaders is
   * enabled).
   */
  colHeader: boolean

  /**
   * Whether this cell is a row header (first column when rowHeaders is
   * enabled).
   */
  rowHeader: boolean

  /**
   * Whether this cell occupies the last row of the grid.
   */
  lastRow: true | undefined

  /**
   * Whether this cell occupies the last column of the grid.
   */
  lastCol: true | undefined
}

/**
 * A two-dimensional array of resolved column tuples representing the full grid.
 */
export type ResolvedGrid = ResolvedCol[][]

/**
 * Map of row indices to inline column definitions used when the grid is defined
 * via template slots.
 */
export type InlineGrid = Map<number, [number, [number, number]][]>

/**
 * Builds the grid factory API from resolved props and events. Composes
 * factories for tabular cell layout, element registration, and accessibility.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends GridProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<GridEmits>
) {
  const config = useConfig()
  const root = useRootDom()
  const { makeFromSchema, makeFromString } = useComponentFactory()
  const { sanitizeCss, sanitizeProps } = useSecurity()

  const api = useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeDisabled())
    .use(makeData())
    .build()

  const {
    container,
    available,
    visible,
    path,
    id,
    disabled,
    children,
    containerModel,
    dataPath,
  } = api

  /**
   * Unique security nonce for injecting scoped styles.
   */
  const nonce = toRef(() => config.nonce)
  const inlineGrid = ref<InlineGrid>(new Map())
  const align = toRef(() => props.align || 'left')
  const valign = toRef(() => props.valign || 'middle')

  /**
   * The grid schema, derived from the grid prop, inline grid, or default
   * rows/cols dimensions.
   */
  const grid = computed<GridSchema>(() => {
    return (
      props.grid ||
      (inlineGrid.value.size
        ? [...inlineGrid.value.values()].map((row) =>
            Object.values(row).map((col) => ({
              colspan: col[1][0],
              rowspan: col[1][1],
            }))
          )
        : [...Array(props.rows || 2)].map(() =>
            [...Array(props.cols || 2)].map(() => null)
          ))
    )
  })

  /**
   * The total number of columns in the grid.
   */
  const cols = computed(() => {
    let maxCols = 0
    for (const row of grid.value) {
      for (let ci = 0; ci < row.length; ci++) {
        if (maxCols < ci + 1) maxCols = ci + 1
        const col = row[ci]
        const colspan =
          col && typeof col === 'object' ? (col as any).colspan || 1 : 1
        if (ci + colspan > maxCols) maxCols = ci + colspan
      }
    }
    return maxCols
  })

  /**
   * The total number of rows in the grid.
   */
  const rows = computed(() => {
    let maxRows = 0
    for (let ri = 0; ri < grid.value.length; ri++) {
      if (maxRows < ri + 1) maxRows = ri + 1
      for (const col of grid.value[ri]) {
        const rowspan =
          col && typeof col === 'object' ? (col as any).rowspan || 1 : 1
        if (ri + rowspan > maxRows) maxRows = ri + rowspan
      }
    }
    return maxRows
  })

  /**
   * The fully resolved grid structure with each cell's content, spans,
   * alignment, and attributes.
   */
  const resolvedGrid = computed(() => {
    const result: ResolvedGrid = []
    for (let r = 0; r < grid.value.length; r++) {
      const resolvedCols: ResolvedCol[] = []
      for (let c = 0; c < grid.value[r].length; c++) {
        resolvedCols.push(resolveCol(grid.value[r][c], r, c))
      }
      result.push(resolvedCols)
    }
    return result
  })

  /**
   * Whether the first row of the grid uses header styling.
   */
  const colHeaders = computed(() => !!props.colHeaders)

  /**
   * Whether the first column of the grid uses header styling.
   */
  const rowHeaders = computed(() => !!props.rowHeaders)

  /**
   * Resolved grid cells with their positions, spans, and grid-area styles.
   */
  const cells = computed(() => {
    const cells: GridCell[] = []

    walkCells(
      resolvedGrid.value,
      ({ field, colIndex, rowIndex, rowStart, colStart, rowEnd, colEnd }) => {
        cells.push({
          ...((field || {}) as ResolvedCell),
          col: colIndex,
          row: rowIndex,
          colStart,
          rowStart,
          colEnd,
          rowEnd,
          colHeader: colHeaders.value && rowIndex === 0,
          rowHeader: rowHeaders.value && colIndex === 0,
          lastRow: rowEnd === rows.value - 1 ? true : undefined,
          lastCol: colEnd === cols.value - 1 ? true : undefined,
        })
      }
    )

    return cells
  })

  /**
   * A unique CSS class scoped to this grid instance, used to target the
   * injected grid style rule.
   */
  const gridClass = computed(() => `vf-grid-${id.value}`)

  /**
   * The full CSS text for the grid layout including template columns, rows,
   * container sizing, and spanned cell grid-area rules.
   */
  const gridCss = computed(() => {
    const colWidths = []

    for (let c = 0; c < Number(cols.value); c++) {
      const width = props.widths?.[c]

      const defaultWidth = c === 0 && rowHeaders.value ? 'min-content' : '1fr'

      colWidths.push(
        typeof width === 'number' ||
          (width !== undefined && width !== null && /\d$/.test(width))
          ? `${width}px`
          : sanitizeCss(width) || defaultWidth
      )
    }

    const minW =
      typeof props.minWidth === 'number'
        ? `${props.minWidth}px`
        : sanitizeCss(props.minWidth)

    const maxW =
      typeof props.maxWidth === 'number'
        ? props.maxWidth > 0
          ? `${props.maxWidth}px`
          : undefined
        : sanitizeCss(props.maxWidth)

    const cls = gridClass.value

    const rules = [
      `.${cls}{grid-template-columns:${colWidths.join(' ')};grid-template-rows:repeat(${rows.value},auto)${minW ? `;min-width:${minW}` : ''}${maxW ? `;max-width:${maxW}` : ''}}`,
    ]

    for (const cell of cells.value) {
      const { colspan, rowspan, colStart, rowStart, colEnd, rowEnd, row, col } =
        cell
      if (colspan > 1 || rowspan > 1) {
        rules.push(
          `.${cls}>[data-row="${row}"][data-col="${col}"]{grid-area:${rowStart + 1}/${colStart + 1}/${rowEnd + 2}/${colEnd + 2}}`
        )
      }
    }

    return rules.join('')
  })

  /**
   * Whether all column widths are fixed (non-fractional), allowing the grid to
   * shrink-wrap.
   */
  const fitWidth = computed(() => {
    if ((props.widths || []).length < (cols.value || 0)) {
      return false
    }

    return (props.widths || [])
      .slice(0, cols.value)
      .every(
        (width) =>
          typeof width === 'number' ||
          (width &&
            [
              'cm',
              'mm',
              'in',
              'px',
              'pt',
              'pc',
              'em',
              'ex',
              'ch',
              'rem',
              'vw',
              'vh',
              'vmin',
              'vmax',
            ].some((unit) => width.endsWith(unit))) ||
          (width && /\d$/.test(width))
      )
  })

  // ============== METHODS ===============

  /**
   * Renders a string cell through the shared string-content pipeline: `{...}`
   * expressions resolve against the form data, then the result renders as
   * escaped text — or as sanitized HTML when `$security.allowHtml` lists the
   * `grid` area.
   */
  const toCellContent = (str: string): Component =>
    makeFromString(str, { htmlArea: 'grid', exprKey: 'grid' })

  const refreshInlineGrid = () => {
    inlineGrid.value.clear()

    if (!root.value) return

    root.value.querySelectorAll('[data-row-id]').forEach((row$) => {
      const cells: [number, [number, number]][] = []
      for (const col$ of row$.querySelectorAll('[data-col-id]')) {
        cells.push([
          Number(col$.getAttribute('data-col-id')),
          [
            Number(col$.getAttribute('data-colspan') || 1),
            Number(col$.getAttribute('data-rowspan') || 1),
          ],
        ])
      }
      inlineGrid.value.set(Number(row$.getAttribute('data-row-id')), cells)
    })
  }

  const resolveCol = (
    col: GridCellContent | GridCellSchema,
    row: number,
    colIdx: number
  ): ResolvedCol => {
    let schema: NamedElementSchema | undefined
    let component: string | Component | null = null
    let colspan: number
    let rowspan: number
    let cellAlign: AlignProp | null
    let cellValign: ValignProp | null
    let attrs: GridCellAttrs

    if (col === null || typeof col === 'string') {
      if (typeof col === 'string') component = toCellContent(col)
      colspan = 1
      rowspan = 1
      cellAlign = null
      cellValign = null
      attrs = {}
    } else {
      const {
        colspan: cs,
        rowspan: rs,
        align: al,
        valign: va,
        attrs: at,
        content: ct,
        ...rest
      } = col as any

      colspan = cs || 1
      rowspan = rs || 1
      cellAlign = al || null
      cellValign = va || null
      attrs = sanitizeProps(at || {})

      if ('type' in col) {
        schema = Object.assign(
          rest,
          ct
            ? {
                content: ct,
              }
            : {}
        ) as NamedElementSchema
      } else if (ct) {
        component = toCellContent(ct)
      }
    }

    // A schema cell without a `name` gets the same derived, position-stable
    // name the cell `key` falls back to — elements declare `name` as a
    // required prop, so leaving it off would warn on every nameless cell.
    if (schema && schema.name === undefined) {
      schema.name = `${props.name}_${row}_${colIdx}`
    }

    const resolvedCell: ResolvedCell = {
      key: schema
        ? String(schema.name ?? `${props.name}_${row}_${colIdx}`)
        : `${row}-${colIdx}`,
      component: schema
        ? (makeFromSchema(schema as Record<string, any>) ?? null)
        : component,
      props: schema ? sanitizeProps(schema) : {},
      colspan,
      rowspan,
      align: cellAlign || props.align || 'left',
      valign: cellValign || props.valign || 'baseline',
      attrs,
      row,
      col: colIdx,
    }

    return [
      resolvedCell,
      resolvedCell.colspan,
      resolvedCell.rowspan,
      resolvedCell.align,
    ]
  }

  useContainerProvider({
    type: 'grid',
    id,
    model: containerModel,
    available,
    visible,
    disabled,
    path,
    dataPath,
    children,
    container,
  })

  createGridContext({
    cells,
    inlineGrid,
    colHeaders,
    rowHeaders,
    align,
    valign,
    refreshInlineGrid,
  })

  return {
    ...api,
    cells,
    colHeaders,
    rowHeaders,
    fitWidth,
    gridClass,
    gridCss,
    nonce,
    resolvedGrid,
    grid,
  }
}

/**
 * Default prop values for the grid blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<GridProps>()({
  type: 'grid',
  layout: true,
  submit: true,
  minWidth: 0,
  maxWidth: -1,
  align: 'left',
  valign: 'baseline',
  rows: 2,
  cols: 2,
  disabled: false,
  // Explicit default (matches Vue's absent-boolean casting): grids are flat
  // unless `nested` is set, mirroring the schema walk's `nested !== true`.
  nested: false,
  conditions: undefined,
  expressions: undefined,
})
