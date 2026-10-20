```ts
/**
 * Part-keyed binding definitions of the VfFile component: its own state
 * markers and per-file entries merged with the `inputAria` pattern entries it
 * registers via `useBindings`. The per-file entries (`item`, `name`,
 * `remove`) are parameterized resolvers, so those keys are functional and
 * templates call `bindings.item(file, index)`; the rest are zero-argument
 * resolvers whose keys stay static.
 */
interface VfFileBindings extends FileBindings, LayoutRegionBindings {
  /**
   * The file input control's validation state and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag

  /**
   * Functional-mode marker for the per-file item part: it contributes no
   * attributes of its own, but keeps the key functional so part overrides
   * resolve with the file entry and index.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  item: (file: FileListItem, index: number) => {}

  /**
   * Functional-mode marker for the per-file name part: it contributes no
   * attributes of its own, but keeps the key functional so part overrides
   * resolve with the file entry and index.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  name: (file: FileListItem, index: number) => {}

  /**
   * The per-file remove control's localized accessible name (VfFile is the
   * remove entry's only consumer, so it is defined in the SFC rather than as
   * a shared pattern).
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
