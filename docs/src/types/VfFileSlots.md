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
   * @param scope The file slot's params.
   */
  file: (scope: {
    /**
     * The raw model value of the file item.
     */
    value: FileProp

    /**
     * The display name of the file.
     */
    fileName: string

    /**
     * The URL of the file, if available.
     */
    url?: string

    /**
     * The index of the file in the list.
     */
    index: number

    /**
     * Whether the file can be removed.
     */
    removable: boolean

    /**
     * Whether the element is disabled.
     */
    disabled: boolean

    /**
     * The kind of value: `'file'`, `'string'`, or `'object'`.
     */
    type: 'file' | 'string' | 'object'

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfFileClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfFileParts>

    /**
     * The component's part-keyed accessibility bindings.
     */
    a11yBindings: VfFileA11y

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind`.
     */
    modifiers: VfFileModifiers

    /**
     * Callback to remove a file by index.
     *
     * @param index The index to remove.
     */
    remove: (index: number) => void
  }) => VNode[]

  /**
   * Slot that replaces the remove button for a file item.
   *
   * @param scope The remove slot's params.
   */
  remove: (scope: {
    /**
     * The index of the file in the list.
     */
    index: number

    /**
     * Whether the element is disabled.
     */
    disabled: boolean

    /**
     * CSS classes for the remove button element.
     */
    classes: ClassValue

    /**
     * Resolved `part:remove` attribute overrides for the remove button
     * element; apply with `v-bind`.
     */
    part: PartOf<'VfButton'> | undefined

    /**
     * Resolved accessibility bindings for this file's remove button
     * (localized aria-label); apply with `v-bind`.
     */
    a11yBindings: ReturnType<VfFileA11y['remove']>

    /**
     * Callback to remove a file by index.
     *
     * @param index The index to remove.
     */
    remove: (index: number) => void
  }) => VNode[]

  /**
   * Slot that replaces the file name display for a file item.
   *
   * @param scope The name slot's params.
   */
  name: (scope: {
    /**
     * The raw model value of the file item.
     */
    value: FileProp

    /**
     * The display name of the file.
     */
    fileName: string

    /**
     * The URL of the file, if available.
     */
    url?: string

    /**
     * The kind of value: `'file'`, `'string'`, or `'object'`.
     */
    type: 'file' | 'string' | 'object'

    /**
     * CSS classes for the file name element.
     */
    classes: ClassValue

    /**
     * Resolved `part:name` attribute overrides for the file name element;
     * apply with `v-bind`.
     */
    part: DomAttrsOf<'a' | 'span'> | undefined
  }) => VNode[]

  /**
   * Slot that replaces the file selection button and hidden input.
   *
   * @param scope The add slot's params.
   */
  add: (scope: {
    /**
     * Whether the element is disabled.
     */
    disabled: boolean

    /**
     * The resolved button label text.
     */
    text?: string

    /**
     * Resolved `part:add` attribute overrides for the add button element;
     * apply with `v-bind`.
     */
    part: PartOf<'VfButton'> | undefined

    /**
     * Callback to open the native file picker.
     */
    triggerFileInput: () => void
  }) => VNode[]
}
```
