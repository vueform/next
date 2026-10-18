import type { Ref, VNode } from 'vue'

import type {
  GridA11y,
  GridApi,
  GridClasses,
  GridEmits,
  GridExpose,
  GridModifiers,
  GridParts,
  GridProps,
  GridSlots,
  GridCell,
} from '#src/blueprints/grid'
import type { ObjectModel } from '#src/features'
import type {
  DefineElementContext,
  ClassValue,
  AlignProp,
  ValignProp,
  DomAttrsOf,
  DefineRegistryEntry,
  EntryPropOf,
  GridToSchema,
  IsAny,
  SchemaToModel,
  WidenProps,
} from '#src/types'

/**
 * Resolves the `grid` schema from a registry `TEntry` payload (unwrapping a
 * possible `Ref`), falling back to `undefined` when absent.
 */
export type EntryGridOf<TEntry> =
  EntryPropOf<TEntry, 'grid'> extends infer G
    ? G extends Ref<infer V>
      ? V
      : G
    : undefined

/**
 * Grids carry a model shaped by their named cell elements regardless of
 * `nested`: nested grids store it under their own key, non-nested grids bind
 * the same shape as a scoped projection of the parent's level. Wide / `any`
 * entries and grids without a `grid` schema stay permissive (`ObjectModel`).
 */
export type GridModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'nested'>> extends true
    ? ObjectModel
    : EntryGridOf<TEntry> extends infer G
      ? [G] extends [undefined]
        ? ObjectModel
        : SchemaToModel<GridToSchema<G>>
      : ObjectModel

/**
 * VfGrid props narrowed from a registry `TEntry` payload — `modelValue` is
 * driven by `grid` the same way select models are driven by `items`. Feeds both
 * `defineSchema` validation and the narrowed `VfGridContext` / `GridApi` model
 * slice used by `find()`.
 */
export type EntryProps<TEntry> = Omit<VfGridProps, 'modelValue'> & {
  modelValue?: GridModelOf<TEntry>
}

/**
 * Props for the VfGrid component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfGridProps extends GridProps<
  'grid',
  VfGridSlots,
  VfGridParts,
  VfGridClasses,
  VfGridContext
> {}

/**
 * Events emitted by the VfGrid component.
 */
export interface VfGridEmits extends GridEmits<VfGridContext> {}

/**
 * Slots available in the VfGrid component.
 */
export interface VfGridSlots extends GridSlots<VfGridContext> {
  /**
   * Slot that replaces the default grid content. Receives the resolved grid
   * cells.
   */
  default: (scope: {
    /**
     * The resolved grid cells.
     */
    cells: GridCell[]
  }) => VNode[]

  /**
   * Slot that replaces each individual grid cell rendering.
   */
  cell: (scope: {
    /**
     * The resolved grid cell.
     */
    cell: GridCell
  }) => VNode[]
}

/**
 * Structural parts of the VfGrid component.
 */
export interface VfGridParts extends GridParts {
  /**
   * The grid layout element.
   *
   * @tag div
   */
  grid: DomAttrsOf<'div'>

  /**
   * Each cell element. Receives alignment, schema, and header options.
   *
   * @param options Alignment, optional schema, and header flags for this cell.
   * @tag div
   */
  cell: (options: {
    align: AlignProp
    valign: ValignProp
    schema?: any
    colHeader?: boolean
    rowHeader?: boolean
  }) => DomAttrsOf<'div'>
}

/**
 * CSS classes for the VfGrid component's structural parts.
 */
export interface VfGridClasses extends GridClasses {
  /**
   * The grid wrapper element.
   */
  wrapper: ClassValue

  /**
   * The grid layout element.
   */
  grid: ClassValue

  /**
   * Each cell element. Receives alignment, schema, and header options.
   *
   * @param options Alignment, optional schema, and header flags for this cell.
   */
  cell: (options: {
    /**
     * The cell's horizontal alignment.
     */
    align: AlignProp

    /**
     * The cell's vertical alignment.
     */
    valign: ValignProp

    /**
     * The element schema rendered in the cell, if any.
     */
    schema?: any

    /**
     * Whether the cell is a column header.
     */
    colHeader?: boolean

    /**
     * Whether the cell is a row header.
     */
    rowHeader?: boolean
  }) => ClassValue
}

/**
 * Accessibility bindings of the VfGrid component.
 */
export interface VfGridA11y extends GridA11y {}

/**
 * Styling modifiers of the VfGrid component.
 */
export interface VfGridModifiers extends GridModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The grid wrapper's scroll-mode marker, set while `scrollable` is enabled.
   */
  wrapper: {
    'data-scrollable'?: ''
  }

  /**
   * The grid element's fit marker, set while the grid fits its columns to a
   * fixed width.
   */
  grid: {
    'data-fit'?: ''
  }

  /**
   * Each cell element's horizontal and vertical alignment attributes.
   *
   * @param options Alignment, optional schema, and header flags for this cell.
   */
  cell: (options: {
    align: AlignProp
    valign: ValignProp
    schema?: any
    colHeader?: boolean
    rowHeader?: boolean
  }) => {
    'data-align'?: AlignProp
    'data-valign'?: ValignProp
  }
}

/**
 * Augmentable public API surface for VfGrid.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `GridExpose` for all grid-based components) so they
 * appear on `ContextOf<'VfGrid'>` / `context$` / `defineExpose`.
 */
export interface VfGridExpose extends GridExpose {}

/**
 * Public context for VfGrid, optionally parameterized by concrete props (e.g.
 * grid-schema-narrowed `EntryProps` with a typed `modelValue`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfGridContext<
  TProps extends WidenProps<VfGridProps, GridProps<string>> = VfGridProps,
> extends DefineElementContext<
  TProps,
  VfGridEmits,
  VfGridSlots,
  VfGridParts,
  VfGridClasses,
  VfGridModifiers,
  VfGridA11y,
  VfGridExpose,
  GridApi<TProps>
> {}

/**
 * Registry entry for VfGrid. `TEntry` narrows `modelValue` from the entry's
 * `grid` schema so `defineSchema` constrains grid models to their named cell
 * elements (nested and non-nested alike) and types `find()`'s returned `model`
 * the same way.
 */
export interface VfGridEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfGridEmits,
  VfGridSlots,
  VfGridParts,
  VfGridClasses,
  VfGridContext<EntryProps<TEntry>>
> {}
