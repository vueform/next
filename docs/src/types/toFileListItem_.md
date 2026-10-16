```ts
/**
 * Normalizes a single raw file value into a `FileListItem` for display. Newly
 * added `File` instances are always removable. Pre-existing items (strings and
 * objects) respect the element-level `removable` flag and per-item `remove`
 * override.
 */
function toFileListItem(
  v: File | string | FileObject,
  removable: boolean,
  { $security }: { $security: Pick<SecurityModule, 'sanitizeUrl'> }
): FileListItem
```
