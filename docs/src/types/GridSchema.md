```ts
/**
 * A two-dimensional grid schema where each row is an array of cell content or
 * cell objects.
 */
type GridSchema = (GridCellContent | GridCellSchema)[][]
```
