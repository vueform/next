```ts
/**
 * A fully resolved matrix row with its component, props, column mappings, and
 * removal handler.
 */
type ResolvedMatrixRow = {
  /**
   * The Vue component name for this row (e.g. VfRadios, VfCheckboxes, VfGroup).
   */
  component: string

  /**
   * The resolved props passed to the row component.
   */
  props: {
    /**
     * The row's element name used to register it in the matrix data model.
     */
    name: ElementName

    /**
     * The display label for this row.
     */
    label: string

    /**
     * Conditional visibility rules for this row.
     */
    conditions: ConditionalProp | undefined

    /**
     * Validation rules applied to this row.
     */
    rules: RulesProp | undefined

    /**
     * Set to `false` to render the row's children without any layout wrapper.
     */
    layout: false

    /**
     * Whether the row nests its data under the row key in the matrix model.
     */
    nested: boolean | undefined
  }

  /**
   * The resolved columns belonging to this row.
   */
  cols: ResolvedMatrixCol[]

  /**
   * The slot name for rendering custom row content.
   */
  slot: string

  /**
   * The unique DOM id for this row, used for ARIA references.
   */
  id: string

  /**
   * The stable `v-for` key for this row: a per-item id for dynamic matrices or
   * the named row value for static ones. Stays constant across reorders so the
   * row's component instance (and its state) follows its data.
   */
  key: string

  /**
   * The row's current data index (canonical position in the matrix model). Used
   * for drag identity and child data binding.
   */
  dataIndex: number

  /**
   * Reactive boolean indicating whether the row is currently visible.
   */
  available: Ref<boolean>

  /**
   * Removes this row from the matrix.
   */
  remove: () => void
}
```
