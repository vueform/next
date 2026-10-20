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
  item: ClassValue

  /**
   * The file name text or link.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  name: ClassValue

  /**
   * The remove button for a file entry.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  remove: ClassValue

  /**
   * The hidden file `<input>` tag.
   */
  input: ClassValue
}
```
