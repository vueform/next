```ts
/**
 * Provides drag-and-drop reordering for container elements such as lists and
 * matrices.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeSortable: (
  config?: unknown
) => (options: MakeSortableOptions) => {
  list: Ref<any, any>
  canSort: ComputedRef<boolean>
  dropTarget: ComputedRef<any>
  handleDragStart: (e: DragEvent, index: number) => void
  handleDragEnter: (e: DragEvent, index: number) => void
  handleDrop: (e: DragEvent) => void
  handleDragEnd: () => void
  handleWrapperDragOver: (e: DragEvent) => void
}
```
