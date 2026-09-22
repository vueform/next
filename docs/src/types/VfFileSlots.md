```ts
/**
 * Slots available in the VfFile component.
 */
interface VfFileSlots<TMultiple extends boolean = boolean> extends FileSlots<
  VfFileContext<VfFileProps<TMultiple>>
> {
  /**
   * Slot that replaces the rendering of a single file item in the list.
   *
   * @param props.value The raw model value of the file item.
   * @param props.fileName The display name of the file.
   * @param props.url The URL of the file, if available.
   * @param props.index The index of the file in the list.
   * @param props.removable Whether the file can be removed.
   * @param props.disabled Whether the element is disabled.
   * @param props.type The kind of value: `'file'`, `'string'`, or `'object'`.
   * @param props.remove Callback to remove a file by index.
   */
  file: (props: {
    value: FileProp
    fileName: string
    url?: string
    index: number
    removable: boolean
    disabled: boolean
    type: 'file' | 'string' | 'object'
    remove: (index: number) => void
  }) => VNode[]

  /**
   * Slot that replaces the remove button for a file item.
   *
   * @param props.index The index of the file in the list.
   * @param props.disabled Whether the element is disabled.
   * @param props.remove Callback to remove a file by index.
   */
  remove: (props: {
    index: number
    disabled: boolean
    remove: (index: number) => void
  }) => VNode[]

  /**
   * Slot that replaces the file name display for a file item.
   *
   * @param props.value The raw model value of the file item.
   * @param props.fileName The display name of the file.
   * @param props.url The URL of the file, if available.
   * @param props.type The kind of value: `'file'`, `'string'`, or `'object'`.
   */
  name: (props: {
    value: FileProp
    fileName: string
    url?: string
    type: 'file' | 'string' | 'object'
  }) => VNode[]

  /**
   * Slot that replaces the file selection button and hidden input.
   *
   * @param props.triggerFileInput Callback to open the native file picker.
   * @param props.disabled Whether the element is disabled.
   * @param props.text The resolved button label text.
   */
  add: (props: {
    triggerFileInput: () => void
    disabled: boolean
    text?: string
  }) => VNode[]
}
```
