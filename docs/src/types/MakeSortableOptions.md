```ts
/**
 * Configuration for the sortable factory enabling drag-and-drop reordering of
 * container items.
 */
type MakeSortableOptions = {
  props: {
    /**
     * @write
     */
    sort: boolean | undefined
  }
  deps: ReturnsOf<
    [
      [typeof makeRData, ['items', 'sort', 'dragIndex', 'dropIndex']],
      [typeof makeDisabled, ['disabled']],
    ]
  >
}
```
