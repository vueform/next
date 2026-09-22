/**
 * The layout section keys that can receive column width assignments.
 */
export type ColumnKeys = 'container' | 'label' | 'wrapper'

/**
 * A plain column width value expressed as a number or string (e.g. `6` or
 * `'6'`).
 */
export type ColumnsPlain = number | string

/**
 * An object specifying column widths for individual layout sections.
 */
export type ColumnsObject = { [K in ColumnKeys]?: ColumnsPlain }

/**
 * A column width expressed as either a plain value or a per-section object.
 */
export type ColumnsValue = ColumnsPlain | ColumnsObject

/**
 * Responsive column definitions keyed by breakpoint name, excluding layout
 * section keys.
 */
export type BreakpointsColumns = Record<string, ColumnsValue> & {
  [K in ColumnKeys]?: never
}

/**
 * The full columns prop type, supporting plain values, breakpoint objects, or a
 * contextual function.
 *
 * @param context$ The element's component context.
 */
export type ColumnsProp<TContext = any> =
  | ColumnsValue
  | BreakpointsColumns
  | ((context$: TContext) => ColumnsValue | BreakpointsColumns)

/**
 * The resolved column widths after normalization, including the computed
 * `group` and `full` values.
 */
export type ResolvedColumns = Record<ColumnKeys | 'group' | 'full', number>
