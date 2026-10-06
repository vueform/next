import type { VNode } from 'vue'

import {
  type FileApi,
  type FileClasses,
  type FileEmits,
  type FileExpose,
  type FileListItem,
  type FileParts,
  type FileProps,
  type FileSlots,
} from '#core/blueprints/file'
import type { EntryMultipleOf } from '#core/features'
import type {
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  ClassValue,
  DomAttrsOf,
  PartOf,
  FileProp,
} from '#core/types'

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
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
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
   * @tag div
   */
  item: (file: FileListItem, index: number) => DomAttrsOf<'div'>

  /**
   * The file name text or link.
   *
   * @tag a | span
   */
  name: (file: FileListItem, index: number) => DomAttrsOf<'a' | 'span'>

  /**
   * The remove button for a file entry.
   *
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
   */
  item: ClassValue

  /**
   * The file name text or link.
   */
  name: ClassValue

  /**
   * The remove button for a file entry.
   */
  remove: ClassValue
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
