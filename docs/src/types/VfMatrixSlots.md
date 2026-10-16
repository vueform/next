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
   * Slot that replaces the header row. Receives class and header definitions.
   *
   * @param scope The header slot's params.
   */
  header: (scope: {
    /**
     * CSS classes for the header row.
     */
    class: ClassValue

    /**
     * The resolved column header definitions.
     */
    headers: (ResolvedMatrixCol | {})[]
  }) => VNode[]

  /**
   * Slot that replaces each column header cell.
   *
   * @param scope The colHeader slot's params.
   */
  colHeader: (scope: {
    /**
     * CSS classes for the column header.
     */
    class: ClassValue

    /**
     * The column header's unique ID.
     */
    id: string

    /**
     * The column header label text.
     */
    label: string
  }) => VNode[]

  /**
   * Slot that replaces each matrix row. Receives row state, drag handlers,
   * label, remove handler, and columns.
   *
   * @param scope The row slot's params.
   */
  row: (scope: {
    /**
     * CSS classes for the row.
     */
    class: ClassValue

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
     * Handler to remove this row.
     */
    remove: () => void

    /**
     * The column element definitions for this row.
     */
    cols: { component: string | Component; props: MatrixElementSchema }[]
  }) => VNode[]

  /**
   * Slot that replaces each row header cell.
   *
   * @param scope The rowHeader slot's params.
   */
  rowHeader: (scope: {
    /**
     * CSS classes for the row header.
     */
    class: ClassValue

    /**
     * The row header label text.
     */
    label: string
  }) => VNode[]

  /**
   * Slot that replaces the drag sort handle wrapper.
   *
   * @param scope The sortWrapper slot's params.
   */
  sortWrapper: (scope: {
    /**
     * CSS classes for the wrapper.
     */
    class: ClassValue

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
   * Slot that replaces the drag handle. Receives class and drag event handlers.
   *
   * @param scope The sort slot's params.
   */
  sort: (scope: {
    /**
     * CSS classes for the handle element.
     */
    class: ClassValue

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
     * CSS classes for the wrapper.
     */
    class: ClassValue

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
     * CSS classes for the remove button.
     */
    class: ClassValue

    /**
     * Handler to remove the row.
     */
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the add row button. Receives class, label, and add
   * handler.
   *
   * @param scope The add slot's params.
   */
  add: (scope: {
    /**
     * CSS classes for the add button.
     */
    class: ClassValue

    /**
     * The button label text.
     */
    label: TProp | string

    /**
     * Handler to add a new row.
     */
    handleAdd: () => void
  }) => VNode[]
}
```
