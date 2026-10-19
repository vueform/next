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
   * Slot that replaces the header row. Receives the header part's classes and
   * part bag and the header definitions.
   *
   * @param scope The header slot's params.
   */
  header: (scope: {
    /**
     * The resolved column header definitions.
     */
    headers: (ResolvedMatrixCol | {})[]

    /**
     * The header row's resolved bindings (classes, part overrides); apply with
     * `v-bind`.
     */
    bindings: VfMatrixBindings['header']
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
     * The column header's resolved bindings (classes, part overrides, sticky
     * modifier); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['colHeader']
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
     * The row header's resolved bindings (classes, part overrides, sticky
     * modifier); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['rowHeader']
  }) => VNode[]

  /**
   * Slot that replaces the drag sort handle wrapper.
   *
   * @param scope The sortWrapper slot's params.
   */
  sortWrapper: (scope: {
    /**
     * The drag sort handle wrapper's resolved bindings (classes, part
     * overrides); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['sortWrapper']

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
     * The drag handle's resolved bindings (classes, part overrides, localized
     * aria-label); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['sort']

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
     * The cell's resolved bindings (classes, part overrides); apply with
     * `v-bind`.
     */
    bindings: VfMatrixBindings['cell']

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
     * The row remove button wrapper's resolved bindings (classes, part
     * overrides); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['removeWrapper']

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
     * The remove button's resolved bindings (classes, part overrides,
     * localized aria-label fallback); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['remove']

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
     * The add button's resolved bindings (classes, part overrides, fallback
     * aria-label); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['add']

    /**
     * Handler to add a new row.
     */
    handleAdd: () => void
  }) => VNode[]
}
```
