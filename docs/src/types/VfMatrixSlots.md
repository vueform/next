```ts
/**
 * Slots available in the VfMatrix component.
 */
interface VfMatrixSlots extends MatrixSlots<VfMatrixContext> {
  /**
   * Slot for the default matrix content.
   */
  default: () => VNode[]

  /**
   * Slot that replaces the header row. Receives the component's classes and
   * parts proxies and the header definitions.
   *
   * @param scope The header slot's params.
   */
  header: (scope: {
    /**
     * The resolved column header definitions.
     */
    headers: (ResolvedMatrixCol | {})[]

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfMatrixClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfMatrixParts>

    /**
     * The component's accessibility bindings, keyed by part name; apply each
     * bag with `v-bind`.
     */
    a11yBindings: VfMatrixA11y

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind` (the `row` bag is a function of the drag state).
     */
    modifiers: VfMatrixModifiers
  }) => VNode[]

  /**
   * Slot that replaces each column header cell.
   *
   * @param scope The colHeader slot's params.
   */
  colHeader: (scope: {
    /**
     * The column header's unique ID.
     */
    id: string

    /**
     * The column header label text.
     */
    label: string

    /**
     * CSS classes for the column header element.
     */
    classes: ClassValue

    /**
     * Resolved `part:colHeader` attribute overrides for the column header
     * element; apply with `v-bind`.
     */
    part: DomAttrsOf<'div'> | undefined

    /**
     * Ready-to-spread styling modifier attributes for the column header
     * element.
     */
    modifiers: VfMatrixModifiers['colHeader']
  }) => VNode[]

  /**
   * Slot that replaces each matrix row. Receives row state, drag handlers,
   * label, remove handler, and columns.
   *
   * @param scope The row slot's params.
   */
  row: (scope: {
    /**
     * The row's item index.
     */
    index: number

    /**
     * Whether this row has a header.
     */
    rowHeader: boolean

    /**
     * Whether this row is currently being dragged.
     */
    beingDragged: boolean

    /**
     * Whether this row is the current drop target.
     */
    isDropTarget: boolean

    /**
     * Whether the row can be removed.
     */
    canRemove: boolean

    /**
     * Whether the row can be sorted via drag-and-drop.
     */
    canSort: boolean

    /**
     * The row header label text.
     */
    label: string

    /**
     * The column element definitions for this row.
     */
    cols: { component: string | Component; props: MatrixElementSchema }[]

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfMatrixClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfMatrixParts>

    /**
     * The component's accessibility bindings, keyed by part name; apply each
     * bag with `v-bind`.
     */
    a11yBindings: VfMatrixA11y

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind` (the `row` bag is a function of the drag state).
     */
    modifiers: VfMatrixModifiers

    /**
     * Handler for the drag enter event.
     *
     * @param $event The native drag event.
     */
    handleDragEnter: ($event: DragEvent) => void

    /**
     * Handler for the drag start event.
     *
     * @param $event The native drag event.
     */
    handleDragStart: ($event: DragEvent) => void

    /**
     * Handler for the drag end event.
     */
    handleDragEnd: () => void

    /**
     * Handler to remove this row.
     */
    remove: () => void
  }) => VNode[]

  /**
   * Slot that replaces each row header cell.
   *
   * @param scope The rowHeader slot's params.
   */
  rowHeader: (scope: {
    /**
     * The row header label text.
     */
    label: string

    /**
     * CSS classes for the row header element.
     */
    classes: ClassValue

    /**
     * Resolved `part:rowHeader` attribute overrides for the row header
     * element; apply with `v-bind`.
     */
    part: DomAttrsOf<'div'> | undefined

    /**
     * Ready-to-spread styling modifier attributes for the row header element.
     */
    modifiers: VfMatrixModifiers['rowHeader']
  }) => VNode[]

  /**
   * Slot that replaces the drag sort handle wrapper.
   *
   * @param scope The sortWrapper slot's params.
   */
  sortWrapper: (scope: {
    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfMatrixClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfMatrixParts>

    /**
     * The component's accessibility bindings, keyed by part name; apply each
     * bag with `v-bind`.
     */
    a11yBindings: VfMatrixA11y

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind` (the `row` bag is a function of the drag state).
     */
    modifiers: VfMatrixModifiers

    /**
     * Handler for the drag enter event.
     *
     * @param $event The native drag event.
     */
    handleDragEnter: ($event: DragEvent) => void

    /**
     * Handler for the drag start event.
     *
     * @param $event The native drag event.
     */
    handleDragStart: ($event: DragEvent) => void

    /**
     * Handler for the drag end event.
     */
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces the drag handle. Receives classes, part, and drag
   * event handlers.
   *
   * @param scope The sort slot's params.
   */
  sort: (scope: {
    /**
     * CSS classes for the drag handle element.
     */
    classes: ClassValue

    /**
     * Resolved `part:sort` attribute overrides for the drag handle element;
     * apply with `v-bind`.
     */
    part: PartOf<'VfButton'> | undefined

    /**
     * Resolved accessibility bindings for this row's drag handle (localized
     * aria-label); apply with `v-bind`.
     */
    a11yBindings: ReturnType<VfMatrixA11y['sort']>

    /**
     * Handler for the drag enter event.
     *
     * @param $event The native drag event.
     */
    handleDragEnter: ($event: DragEvent) => void

    /**
     * Handler for the drag start event.
     *
     * @param $event The native drag event.
     */
    handleDragStart: ($event: DragEvent) => void

    /**
     * Handler for the drag end event.
     */
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces each matrix cell. Receives the component, props for the
   * cell element, and a drag enter handler for sortable rows.
   *
   * @param scope The cell slot's params.
   */
  cell: (scope: {
    /**
     * The component name for the cell element.
     */
    component: string | Component

    /**
     * The props passed to the cell element.
     */
    props: MatrixElementSchema

    /**
     * CSS classes for the cell element.
     */
    classes: ClassValue

    /**
     * Resolved `part:cell` attribute overrides for the cell element; apply
     * with `v-bind`.
     */
    part: DomAttrsOf<'div'> | undefined

    /**
     * Handler for the drag enter event on the cell.
     *
     * @param $event The native drag event.
     */
    handleDragEnter: ($event: DragEvent) => void
  }) => VNode[]

  /**
   * Slot that replaces the row remove button wrapper.
   *
   * @param scope The removeWrapper slot's params.
   */
  removeWrapper: (scope: {
    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfMatrixClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfMatrixParts>

    /**
     * The component's accessibility bindings, keyed by part name; apply each
     * bag with `v-bind`.
     */
    a11yBindings: VfMatrixA11y

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind` (the `row` bag is a function of the drag state).
     */
    modifiers: VfMatrixModifiers

    /**
     * Handler to remove the row.
     */
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the row remove button.
   *
   * @param scope The remove slot's params.
   */
  remove: (scope: {
    /**
     * CSS classes for the remove button element.
     */
    classes: ClassValue

    /**
     * Resolved `part:remove` attribute overrides for the remove button
     * element; apply with `v-bind`.
     */
    part: PartOf<'VfButton'> | undefined

    /**
     * Resolved accessibility bindings for this row's remove button (localized
     * aria-label fallback); apply with `v-bind`.
     */
    a11yBindings: ReturnType<VfMatrixA11y['remove']>

    /**
     * Handler to remove the row.
     */
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the add row button. Receives classes, part, label, and
   * add handler.
   *
   * @param scope The add slot's params.
   */
  add: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string

    /**
     * CSS classes for the add button element.
     */
    classes: ClassValue

    /**
     * Resolved `part:add` attribute overrides for the add button element;
     * apply with `v-bind`.
     */
    part: PartOf<'VfButton'> | undefined

    /**
     * Accessibility bindings for the add control (fallback aria-label); apply
     * with `v-bind`.
     */
    a11yBindings: VfMatrixA11y['add']

    /**
     * Handler to add a new row.
     */
    handleAdd: () => void
  }) => VNode[]
}
```
