import { computed } from 'vue'

import { useCurrentInstance } from '#core/composables'
import { createRowContext, useGridContext } from '#core/contexts'
import { defineDefaults, type DefineEvents } from '#core/helpers'
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
} from '#core/types'

/**
 * Props for the row component blueprint that represents a row within a grid.
 */
export interface RowProps<
  S = RowSlots,
  P = RowParts,
  C = RowClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The number of grid columns this row spans.
   */
  colspan?: number | string

  /**
   * The number of grid rows this row spans.
   */
  rowspan?: number | string

  /**
   * The horizontal alignment of content within the row.
   */
  align?: AlignProp

  /**
   * The vertical alignment of content within the row.
   */
  valign?: ValignProp
}

/**
 * Events emitted by the row component.
 */
export interface RowEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the row component.
 */
export interface RowSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the row component.
 */
export interface RowParts extends BaseComponentParts {}

/**
 * CSS classes of the row component.
 */
export interface RowClasses extends BaseComponentClasses {}

/**
 * Augmentable public API surface for row-based components.
 */
export interface RowExpose extends BaseComponentExpose, RowApi {}

/**
 * Factory API produced by the row blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
export type RowApi<TProps extends RowProps = RowProps> = ReturnType<
  typeof blueprint<TProps>
>

/**
 * Builds the row factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends RowProps>(
  _props: LooseRequired<TProps>,
  _events: DefineEvents<RowEmits>
) {
  const grid = useGridContext()

  /**
   * The unique internal identifier for this row instance.
   */
  const uid = useCurrentInstance().uid

  if (!grid) {
    throw new Error('<VfRow> must be used inside a <VfGrid> component')
  }

  /**
   * The zero-based row index within the parent grid.
   */
  const row = computed(() => [...grid.inlineGrid.value.keys()].indexOf(uid))

  /**
   * The UIDs of the columns belonging to this row.
   */
  const cols = computed(
    () => grid.inlineGrid.value.get(uid)?.map((col) => col[0]) || []
  )

  createRowContext({
    ...grid,
    row,
    cols,
  })

  return {
    uid,
    row,
    cols,
  }
}

/**
 * Default prop values for the row blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<RowProps>()({
  align: 'left',
  valign: 'baseline',
})
