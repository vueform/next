import type {
  InputAriaBag,
  LayoutRegionBindings,
  ClassValue,
  DomAttrsOf,
  PartBindings,
  PartOf,
  DefineElementContext,
  DefineRegistryEntry,
  EntryMultipleOf,
  WidenProps,
} from '@vueform/core'
import type {
  FileUploadProps as PvFileUploadProps,
  FileUploadSlots as AFileUploadSlots,
} from 'primevue/fileupload'
import type { VNode } from 'vue'

import type {
  FileUploadApi,
  FileUploadBindings,
  FileUploadClasses,
  FileUploadEmits,
  FileUploadExpose,
  FileUploadParts,
  FileUploadProps,
  FileUploadSlots,
  forwards,
} from '#src/blueprints/file-upload'
import type { ForwardedSlots } from '#src/types'

/**
 * VfFileUpload props narrowed from a registry `TEntry` payload, applying the
 * entry's `multiple` prop as a generic.
 */
export type EntryProps<TEntry> = VfFileUploadProps<EntryMultipleOf<TEntry>>

/**
 * Generic props interface for the VfFileUpload component, parameterized by the
 * model-driving type argument (e.g. `VfFileUploadProps<true>`). Reach for
 * `VfFileUploadProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfFileUploadProps<
  TMultiple extends boolean = boolean,
> extends FileUploadProps<
  'file-upload',
  TMultiple,
  VfFileUploadSlots<TMultiple>,
  VfFileUploadParts,
  VfFileUploadClasses,
  VfFileUploadContext<VfFileUploadProps<TMultiple>>
> {}

/**
 * Events emitted by the VfFileUpload component, parameterized by the
 * model-driving type argument so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfFileUploadSlots`. Plain usage
 * (`VfFileUploadEmits`) keeps the context wide.
 */
export interface VfFileUploadEmits<
  TMultiple extends boolean = boolean,
> extends FileUploadEmits<VfFileUploadContext<VfFileUploadProps<TMultiple>>> {}

/**
 * Slots available in the VfFileUpload component.
 */
export interface VfFileUploadSlots<TMultiple extends boolean = boolean>
  extends
    FileUploadSlots<VfFileUploadContext<VfFileUploadProps<TMultiple>>>,
    /* @vue-ignore */ ForwardedSlots<
      AFileUploadSlots,
      (typeof forwards.slots)[number]
    > {
  /**
   * Slot that replaces the upload button. Receives the upload handler.
   *
   * @param scope The button slot's params.
   */
  button: (scope: {
    /**
     * The upload handler function.
     */
    upload: () => void

    /**
     * The upload button's resolved bindings (part overrides); apply with
     * `v-bind`.
     */
    bindings: PartBindings<'button', VfFileUploadParts, VfFileUploadBindings>
  }) => VNode[]
}

/**
 * Structural parts of the VfFileUpload component.
 */
export interface VfFileUploadParts extends FileUploadParts {
  /**
   * The wrapper element surrounding the file upload input.
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The file upload element.
   *
   * @tag FileUpload
   */
  input: PvFileUploadProps

  /**
   * The upload button.
   *
   * @tag VfButton
   */
  button: PartOf<'VfButton'>
}

/**
 * CSS classes for the VfFileUpload component's structural parts.
 */
export interface VfFileUploadClasses extends FileUploadClasses {
  /**
   * The wrapper element surrounding the file upload input.
   */
  wrapper: ClassValue

  /**
   * The file upload element.
   */
  input: ClassValue
}

/**
 * Part-keyed binding definitions of the VfFileUpload component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
export interface VfFileUploadBindings
  extends FileUploadBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The file-upload control's validation state and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag
}

/**
 * Augmentable public API surface for VfFileUpload.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `FileUploadExpose` for all file-upload-based components)
 * so they appear on `ContextOf<'VfFileUpload'>` / `context$` / `defineExpose`.
 */
export interface VfFileUploadExpose extends FileUploadExpose {}

/**
 * Public context for VfFileUpload, optionally parameterized by concrete props
 * (e.g. `VfFileUploadContext<VfFileUploadProps<true>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfFileUploadContext<
  TProps extends WidenProps<VfFileUploadProps, FileUploadProps> =
    VfFileUploadProps,
> extends DefineElementContext<
  TProps,
  VfFileUploadEmits,
  VfFileUploadSlots,
  VfFileUploadParts,
  VfFileUploadClasses,
  VfFileUploadBindings,
  VfFileUploadExpose,
  FileUploadApi<TProps>
> {}

/**
 * Registry entry for VfFileUpload. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfFileUploadEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfFileUploadEmits<EntryMultipleOf<TEntry>>,
  VfFileUploadSlots,
  VfFileUploadParts,
  VfFileUploadClasses,
  VfFileUploadContext<EntryProps<TEntry>>
> {}
