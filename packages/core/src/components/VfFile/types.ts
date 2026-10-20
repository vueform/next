import type { VNode } from 'vue'

import type { InputAriaBag, LayoutRegionBindings } from '#src/a11y'
import {
  type FileApi,
  type FileClasses,
  type FileEmits,
  type FileExpose,
  type FileListItem,
  type FileBindings,
  type FileParts,
  type FileProps,
  type FileSlots,
} from '#src/blueprints/file'
import type { ResolvedBindings } from '#src/composables'
import type { EntryMultipleOf } from '#src/features'
import type {
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  ClassValue,
  DomAttrsOf,
  PartOf,
  FileProp,
} from '#src/types'

/**
 * Resolved per-part binding bags for VfFile slot scopes.
 */
type VfFileResolvedBindings = ResolvedBindings<VfFileParts, VfFileBindings>

/**
 * VfFile props narrowed from a registry `TEntry` payload, applying the entry's
 * `multiple` prop as a generic.
 */
export type EntryProps<TEntry> = VfFileProps<EntryMultipleOf<TEntry>>

/**
 * Generic props interface for the VfFile component, parameterized by the
 * model-driving type argument (e.g. `VfFileProps<true>`). Reach for
 * `VfFileProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfFileProps<
  TMultiple extends boolean = boolean,
> extends FileProps<
  'file',
  TMultiple,
  VfFileSlots<TMultiple>,
  VfFileParts,
  VfFileClasses,
  VfFileContext<VfFileProps<TMultiple>>
> {}

/**
 * Events emitted by the VfFile component, parameterized by the model-driving
 * type argument so event handlers (e.g. `@change`) receive the narrowed context
 * — same pattern as `VfFileSlots`. Plain usage (`VfFileEmits`) keeps the
 * context wide.
 */
export interface VfFileEmits<
  TMultiple extends boolean = boolean,
> extends FileEmits<VfFileContext<VfFileProps<TMultiple>>> {}

/**
 * Slots available in the VfFile component.
 */
export interface VfFileSlots<
  TMultiple extends boolean = boolean,
> extends FileSlots<VfFileContext<VfFileProps<TMultiple>>> {
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
     * The file item's resolved bindings (part overrides); apply with
     * `v-bind`.
     */
    bindings: VfFileResolvedBindings['item']

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
     * The remove button's resolved bindings (part overrides, localized
     * aria-label); apply with `v-bind`.
     */
    bindings: VfFileResolvedBindings['remove']

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
     * The file name element's resolved bindings (part overrides); apply with
     * `v-bind`.
     */
    bindings: VfFileResolvedBindings['name']
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
     * The add button's resolved bindings (part overrides); apply with
     * `v-bind`.
     */
    bindings: VfFileResolvedBindings['add']

    /**
     * Callback to open the native file picker.
     */
    triggerFileInput: () => void
  }) => VNode[]
}

/**
 * Structural parts of the VfFile component.
 */
export interface VfFileParts extends FileParts {
  /**
   * The container for the list of uploaded files.
   *
   * @tag div
   */
  list: DomAttrsOf<'div'>

  /**
   * An individual file entry in the file list.
   *
   * @param file The file entry data.
   * @param index The file's index in the list.
   * @tag div
   */
  item: (file: FileListItem, index: number) => DomAttrsOf<'div'>

  /**
   * The file name text or link.
   *
   * @param file The file entry data.
   * @param index The file's index in the list.
   * @tag a | span
   */
  name: (file: FileListItem, index: number) => DomAttrsOf<'a' | 'span'>

  /**
   * The remove button for a file entry.
   *
   * @param file The file entry data.
   * @param index The file's index in the list.
   * @tag VfButton
   */
  remove: (file: FileListItem, index: number) => PartOf<'VfButton'>

  /**
   * The add button.
   *
   * @tag VfButton
   */
  add: PartOf<'VfButton'>

  /**
   * The file input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>
}

/**
 * CSS classes for the VfFile component's structural parts.
 */
export interface VfFileClasses extends FileClasses {
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

/**
 * Part-keyed binding definitions of the VfFile component: its own state
 * markers and per-file entries merged with the `inputAria` pattern entries it
 * registers via `useBindings`. The per-file entries (`item`, `name`,
 * `remove`) are parameterized resolvers, so those keys are functional and
 * templates call `bindings.item(file, index)`; the rest are zero-argument
 * resolvers whose keys stay static.
 */
export interface VfFileBindings extends FileBindings, LayoutRegionBindings {
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

/**
 * Augmentable public API surface for VfFile.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `FileExpose` for all file-based components) so they
 * appear on `ContextOf<'VfFile'>` / `context$` / `defineExpose`.
 */
export interface VfFileExpose extends FileExpose {}

/**
 * Public context for VfFile, optionally parameterized by concrete props (e.g.
 * `VfFileContext<VfFileProps<true>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfFileContext<
  TProps extends WidenProps<VfFileProps, FileProps> = VfFileProps,
> extends DefineElementContext<
  TProps,
  VfFileEmits,
  VfFileSlots,
  VfFileParts,
  VfFileClasses,
  VfFileBindings,
  VfFileExpose,
  FileApi<TProps>
> {}

/**
 * Registry entry for VfFile. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
export interface VfFileEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfFileEmits<EntryMultipleOf<TEntry>>,
  VfFileSlots,
  VfFileParts,
  VfFileClasses,
  VfFileContext<EntryProps<TEntry>>
> {}
