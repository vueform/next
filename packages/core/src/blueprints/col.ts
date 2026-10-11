import { computed, onMounted, toRef, watch } from 'vue'

import { useConfig, useCurrentInstance } from '#src/composables'
import { useRowContext } from '#src/contexts'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentExpose,
  BaseComponentClasses,
  AlignProp,
  ValignProp,
  LooseRequired,
} from '#src/types'

/**
 * Props for the col component blueprint that represents a column cell within a
 * row.
 */
export interface ColProps<
  S = ColSlots,
  P = ColParts,
  C = ColClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The number of grid columns this cell spans.
   */
  colspan?: number | string

  /**
   * The number of grid rows this cell spans.
   */
  rowspan?: number | string

  /**
   * Horizontal alignment of the cell content.
   */
  align?: AlignProp

  /**
   * Vertical alignment of the cell content.
   */
  valign?: ValignProp

  /**
   * Whether this column cell should be styled as a header. Automatically
   * resolves to column header, row header, or both based on position.
   */
  header?: boolean
}

/**
 * Events emitted by the col component.
 */
export interface ColEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the col component.
 */
export interface ColSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the col component.
 */
export interface ColParts extends BaseComponentParts {}

/**
 * CSS classes of the col component.
 */
export interface ColClasses extends BaseComponentClasses {}

/**
 * Augmentable public API surface for col-based components.
 */
export interface ColExpose extends BaseComponentExpose, ColApi {}

/**
 * Factory API produced by the col blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
export type ColApi<TProps extends ColProps = ColProps> = ReturnType<
  typeof blueprint<TProps>
>

/**
 * Builds the col factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ColProps>(
  props: LooseRequired<TProps>,
  _events: DefineEvents<ColEmits>
) {
  const rowContext = useRowContext()
  const config = useConfig()

  /**
   * The unique identifier of the component instance, used to key the cell
   * within the parent row.
   */
  const uid = useCurrentInstance().uid

  if (!rowContext) {
    throw new Error('<VfCol> must be used inside a <VfRow> component')
  }

  const {
    cells,
    cols,
    row,
    colHeaders,
    rowHeaders,
    align: gridAlign,
    valign: gridValign,
    refreshInlineGrid,
  } = rowContext

  // ================ REFS ================

  /**
   * Unique security nonce for injecting scoped styles.
   */
  const nonce = toRef(() => config.nonce)

  // ============== COMPUTED ==============

  /**
   * The zero-based column index within the parent row.
   */
  const col = computed(() => cols.value.indexOf(uid))

  /**
   * The grid cell data for this column at the current row position.
   */
  const cell = computed(() =>
    cells.value.find((cell) => cell.col === col.value && cell.row === row.value)
  )

  /**
   * The resolved horizontal alignment, falling back to the grid's align prop.
   */
  const align = toRef(() => props.align || gridAlign.value)

  /**
   * The resolved vertical alignment, falling back to the grid's valign prop.
   */
  const valign = toRef(() => props.valign || gridValign.value)

  /**
   * Whether this cell should be styled as a column header, resolved from the
   * header prop and position or the parent grid's colHeaders setting.
   */
  const colHeader = computed(() => {
    if (colHeaders.value && row.value === 0) return true
    if (props.header) return row.value === 0 || col.value !== 0
    return false
  })

  /**
   * Whether this cell should be styled as a row header, resolved from the
   * header prop and position or the parent grid's rowHeaders setting.
   */
  const rowHeader = computed(() => {
    if (rowHeaders.value && col.value === 0) return true
    if (props.header) return col.value === 0 || row.value !== 0
    return false
  })

  /**
   * The number of columns the cell spans.
   */
  const colspan = toRef(() => Number(props.colspan || 1))

  /**
   * The number of rows the cell spans.
   */
  const rowspan = toRef(() => Number(props.rowspan || 1))

  /**
   * The CSS text for the cell's grid-area when it spans multiple columns or
   * rows.
   */
  const cellCss = computed(() => {
    const c = cell.value
    if (!c || (colspan.value <= 1 && rowspan.value <= 1)) return ''
    return `[data-col-id="${uid}"]{grid-area:${c.rowStart + 1}/${c.colStart + 1}/${c.rowEnd + 2}/${c.colEnd + 2}}`
  })

  // ================ HOOKS ===============

  onMounted(refreshInlineGrid)

  // ============== WATCHERS ==============

  watch([() => props.colspan, () => props.rowspan], refreshInlineGrid, {
    flush: 'post',
  })

  return {
    align,
    valign,
    cell,
    cellCss,
    colspan,
    rowspan,
    colHeader,
    rowHeader,
    nonce,
    uid,
  }
}

/**
 * Default prop values for the col blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ColProps>()({})
