```ts
/**
 * A grid cell defined as a flat object merging grid layout properties with
 * either an element schema (has `type`) or text content (has `content`).
 */
type GridCellSchema = GridCellLayoutProps &
  (NamedElementSchema | { content?: string })
```
