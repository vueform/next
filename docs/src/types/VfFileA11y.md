```ts
/**
 * Accessibility bindings of the VfFile component: the `inputAria` pattern's
 * bags plus the per-file remove control's bag, registered via `useA11y` in
 * the SFC (VfFile is the remove bag's only consumer, so it is defined there
 * rather than as a shared pattern).
 */
interface VfFileA11y extends FileA11y, InputAriaA11y {
  /**
   * The per-file remove control's localized accessible name.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  remove: (
    file: FileListItem,
    index: number
  ) => {
    'aria-label': string
  }
}
```
