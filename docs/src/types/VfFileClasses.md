```ts
/**
 * CSS classes for the VfFile component's structural parts.
 */
interface VfFileClasses extends FileClasses {
  /**
   * The container for the list of uploaded files.
   */
  list: ClassValue

  /**
   * An individual file entry in the file list.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  item: (file: FileListItem, index: number) => ClassValue

  /**
   * The file name text or link.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  name: (file: FileListItem, index: number) => ClassValue

  /**
   * The remove button for a file entry.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  remove: (file: FileListItem, index: number) => ClassValue

  /**
   * The hidden file `<input>` tag.
   */
  input: ClassValue
}
```
