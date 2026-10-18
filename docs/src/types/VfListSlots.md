```ts
/**
 * Slots available in the VfList component.
 */
interface VfListSlots extends ListSlots<VfListContext> {
  /**
   * Slot that replaces each list item wrapper. Receives drag state and event
   * handlers.
   *
   * @param scope The item slot's params.
   */
  item: (scope: {
    /**
     * The item's index.
     */
    index: number

    /**
     * Whether this item is currently being dragged.
     */
    beingDragged: boolean

    /**
     * Whether this item is the current drop target.
     */
    isDropTarget: boolean

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfListClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfListParts>

    /**
     * The component's accessibility bindings, keyed by part name; apply each
     * bag with `v-bind`.
     */
    a11yBindings: VfListA11y

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind` (the `item` bag is a function of the drag state).
     */
    modifiers: VfListModifiers

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
     * Handler to remove this list item.
     */
    handleRemove: () => void
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
     * Resolved accessibility bindings for this item's drag handle (localized
     * aria-label); apply with `v-bind`.
     */
    a11yBindings: ReturnType<VfListA11y['sort']>

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
   * Slot that replaces the default element content within each list item.
   *
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The component name for the list item element.
     */
    component?: string | Component

    /**
     * The props passed to the list item element.
     */
    props: Record<string, any>

    /**
     * The element name/index for this item.
     */
    index: ElementName
  }) => VNode[]

  /**
   * Slot that replaces the remove button. Receives classes, part, and remove
   * handler.
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
     * Resolved accessibility bindings for this item's remove button
     * (localized aria-label fallback); apply with `v-bind`.
     */
    a11yBindings: ReturnType<VfListA11y['remove']>

    /**
     * Handler to remove this list item.
     */
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the placeholder element when the list is empty.
   *
   * @param scope The placeholder slot's params.
   */
  placeholder: (scope: {
    /**
     * CSS classes for the placeholder element.
     */
    classes: ClassValue

    /**
     * Resolved `part:placeholder` attribute overrides for the placeholder
     * element; apply with `v-bind`.
     */
    part: DomAttrsOf<'div'> | undefined

    /**
     * Accessibility bindings for the placeholder (id, status role); apply
     * with `v-bind` so the add button's describedby keeps resolving.
     */
    a11yBindings: VfListA11y['placeholder']
  }) => VNode[]

  /**
   * Slot that replaces the add button. Receives classes, part, add handler,
   * and label.
   *
   * @param scope The add slot's params.
   */
  add: (scope: {
    /**
     * The button label text.
     */
    label: any

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
     * Accessibility bindings for the add control (fallback aria-label,
     * placeholder describedby); apply with `v-bind`.
     */
    a11yBindings: VfListA11y['add']

    /**
     * Handler to add a new list item.
     */
    handleAdd: () => void
  }) => VNode[]
}
```
