```ts
/**
 * Slots available in the VfGrid component.
 */
interface VfGridSlots extends GridSlots<VfGridContext> {
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
```
