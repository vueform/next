```ts
/**
 * Slots available in the VfGrid component.
 */
interface VfGridSlots extends GridSlots<VfGridContext> {
  /**
   * Slot that replaces the default grid content. Receives the resolved grid
   * cells.
   */
  default: (props: { cells: GridCell[] }) => VNode[]

  /**
   * Slot that replaces each individual grid cell rendering.
   */
  cell: (props: { cell: GridCell }) => VNode[]
}
```
