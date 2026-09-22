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
   * @param props.class CSS classes for the header row.
   * @param props.headers The resolved column header definitions.
   */
  header: (props: {
    class: ClassValue
    headers: (ResolvedMatrixCol | {})[]
  }) => VNode[]

  /**
   * Slot that replaces each column header cell.
   *
   * @param props.class CSS classes for the column header.
   * @param props.id The column header's unique ID.
   * @param props.label The column header label text.
   */
  colHeader: (props: {
    class: ClassValue
    id: string
    label: string
  }) => VNode[]

  /**
   * Slot that replaces each matrix row. Receives row state, drag handlers,
   * label, remove handler, and columns.
   *
   * @param props.class CSS classes for the row.
   * @param props.index The row's item index.
   * @param props.rowHeader Whether this row has a header.
   * @param props.beingDragged Whether this row is currently being dragged.
   * @param props.isDropTarget Whether this row is the current drop target.
   * @param props.handleDragEnter Handler for the drag enter event.
   * @param props.handleDragStart Handler for the drag start event.
   * @param props.handleDragEnd Handler for the drag end event.
   * @param props.canRemove Whether the row can be removed.
   * @param props.canSort Whether the row can be sorted via drag-and-drop.
   * @param props.label The row header label text.
   * @param props.remove Handler to remove this row.
   * @param props.cols The column element definitions for this row.
   */
  row: (props: {
    class: ClassValue
    index: number
    rowHeader: boolean
    beingDragged: boolean
    isDropTarget: boolean
    handleDragEnter: ($event: DragEvent) => void
    handleDragStart: ($event: DragEvent) => void
    handleDragEnd: () => void
    canRemove: boolean
    canSort: boolean
    label: string
    remove: () => void
    cols: { component: string | Component; props: MatrixElementSchema }[]
  }) => VNode[]

  /**
   * Slot that replaces each row header cell.
   *
   * @param props.class CSS classes for the row header.
   * @param props.label The row header label text.
   */
  rowHeader: (props: { class: ClassValue; label: string }) => VNode[]

  /**
   * Slot that replaces the drag sort handle wrapper.
   *
   * @param props.class CSS classes for the wrapper.
   * @param props.handleDragStart Handler for the drag start event.
   * @param props.handleDragEnd Handler for the drag end event.
   */
  sortWrapper: (props: {
    class: ClassValue
    handleDragEnter: ($event: DragEvent) => void
    handleDragStart: ($event: DragEvent) => void
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces the drag handle. Receives class and drag event handlers.
   *
   * @param props.class CSS classes for the handle element.
   * @param props.handleDragStart Handler for the drag start event.
   * @param props.handleDragEnd Handler for the drag end event.
   */
  sort: (props: {
    class: ClassValue
    handleDragEnter: ($event: DragEvent) => void
    handleDragStart: ($event: DragEvent) => void
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces each matrix cell. Receives the component, props for the
   * cell element, and a drag enter handler for sortable rows.
   *
   * @param props.component The component name for the cell element.
   * @param props.props The props passed to the cell element.
   * @param props.handleDragEnter Handler for the drag enter event on the cell.
   */
  cell: (props: {
    component: string | Component
    props: MatrixElementSchema
    handleDragEnter: ($event: DragEvent) => void
  }) => VNode[]

  /**
   * Slot that replaces the row remove button wrapper.
   *
   * @param props.class CSS classes for the wrapper.
   * @param props.handleRemove Handler to remove the row.
   */
  removeWrapper: (props: {
    class: ClassValue
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the row remove button.
   *
   * @param props.class CSS classes for the remove button.
   * @param props.handleRemove Handler to remove the row.
   */
  remove: (props: { class: ClassValue; handleRemove: () => void }) => VNode[]

  /**
   * Slot that replaces the add row button. Receives class, label, and add
   * handler.
   *
   * @param props.class CSS classes for the add button.
   * @param props.label The button label text.
   * @param props.handleAdd Handler to add a new row.
   */
  add: (props: {
    class: ClassValue
    label: TProp | string
    handleAdd: () => void
  }) => VNode[]
}
```
