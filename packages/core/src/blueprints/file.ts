import { computed, toRef } from 'vue'

import {
  useDynamicProp,
  useFeatures,
  useLocale,
  useSecurity,
} from '#src/composables'
import { useContext } from '#src/contexts'
import {
  makeData,
  makeElement,
  makeInteraction,
  makeDisabled,
  makeInput,
  makeProvider,
  makeLayout,
  type DisabledProps,
  type ModelPropsWithDefault,
  type BaseElementEmits,
  type BaseElementProps,
  type ValidationProps,
  type BaseFieldElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementBindings,
  type BaseElementSlots,
  type MultipleProps,
  type LayoutProps,
  type ModelEmits,
  type FileModelOf,
  type FileModelProp,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type ModelApi,
} from '#src/features'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type { SecurityModule } from '#src/modules/security'
import type { DProp, FileProp, LooseRequired, TProp } from '#src/types'

/**
 * The model value type carried by the file element's wide props.
 */
type FileModel = Required<FileProps>['modelValue']

/**
 * Props for the file element blueprint, parameterized by the model-driving type
 * argument (`multiple`). Plain usage (`FileProps`) keeps every member wide, so
 * no separate plain-props alias is needed.
 *
 * - `multiple: false` — model is `File | null`
 * - `multiple: true` — model is `File[]`
 */
export interface FileProps<
  T extends string = 'file',
  TMultiple extends boolean = boolean,
  S = FileSlots,
  P = FileParts,
  C = FileClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelPropsWithDefault<FileModelProp<TMultiple>, TContext>,
    ValidationProps<TContext>,
    DisabledProps<TContext>,
    MultipleProps<TMultiple> {
  /**
   * Whether pre-existing (non-File) items can be removed. Defaults to `true`.
   * Newly added files are always removable regardless of this setting.
   */
  remove?: boolean

  /**
   * Whether the file select button should be displayed.
   */
  add?: boolean

  /**
   * The accepted file types (e.g. `image/*`, `.pdf,.docx`).
   */
  accept?: string

  /**
   * The capture attribute for mobile device camera/microphone access (e.g.
   * `user`, `environment`).
   */
  capture?: 'user' | 'environment' | boolean

  /**
   * The label text displayed on the file selection button.
   */
  text?: TProp<string, TContext>

  /**
   * The icon identifier for the add button.
   */
  addIcon?: DProp<string, TContext>

  /**
   * The icon identifier for the remove button.
   */
  removeIcon?: DProp<string, TContext>
}

/**
 * Events emitted by the file element.
 */
export interface FileEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<FileModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<FileModel, TContext> {
  /**
   * Emitted for each newly added file. In multi mode fires once per file.
   *
   * @param file The newly added file.
   * @param context$ The component context.
   */
  add: [file: File, context$: TContext]

  /**
   * Emitted when a file is removed from the list.
   *
   * @param value The raw model value of the removed item.
   * @param context$ The component context.
   */
  remove: [value: File | string | FileObject, context$: TContext]
}

/**
 * Slots available on the file element blueprint.
 */
export interface FileSlots<TContext = any> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the file element blueprint.
 */
export interface FileParts extends BaseFieldElementParts {}

/**
 * CSS classes for the file element blueprint.
 */
export interface FileClasses extends BaseElementClasses {}

/**
 * Augmentable part-keyed binding definitions (a11y, state markers, and
 * other per-part attrs) of the file blueprint.
 */
export interface FileBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for file-based components.
 */
export interface FileExpose extends BaseElementExpose, FileApi {}

/**
 * Describes a previously uploaded file with optional display metadata. All
 * properties are optional to allow custom object shapes — the defaults provide
 * an opinionated structure for the built-in file list rendering.
 */
export interface FileObject {
  /**
   * The display name of the file.
   */
  name?: string

  /**
   * A URL to link the file name to.
   */
  url?: string

  /**
   * Whether the file can be removed. Defaults to `true` when omitted.
   */
  remove?: boolean

  [key: string]: unknown
}

/**
 * A normalized file entry used for rendering the file list.
 */
export interface FileListItem {
  /**
   * The display name of the file.
   */
  name: string

  /**
   * An optional URL to render the name as a link.
   */
  url?: string

  /**
   * Whether the file can be removed from the list.
   */
  removable: boolean

  /**
   * The kind of the original value: `'file'` for `File` instances, `'string'`
   * for plain strings, or `'object'` for `FileObject` entries.
   */
  type: 'file' | 'string' | 'object'

  /**
   * The original raw value from the model (`File`, `string`, or `FileObject`).
   * Available for custom slot rendering.
   */
  raw: FileProp
}

/**
 * Factory API produced by the file blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
export type FileApi<TProps extends FileProps<string> = FileProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Checks whether a value is a `FileObject` (a non-null plain object that is not
 * a File instance).
 */
export function isFileObject(v: unknown): v is FileObject {
  return typeof v === 'object' && v !== null && !(v instanceof File)
}

/**
 * Normalizes a single raw file value into a `FileListItem` for display. Newly
 * added `File` instances are always removable. Pre-existing items (strings and
 * objects) respect the element-level `removable` flag and per-item `remove`
 * override.
 */
export function toFileListItem(
  v: File | string | FileObject,
  removable: boolean,
  { $security }: { $security: Pick<SecurityModule, 'sanitizeUrl'> }
): FileListItem {
  if (v instanceof File) {
    return { name: v.name, removable: true, type: 'file', raw: v }
  }
  if (typeof v === 'string') {
    return { name: v, removable, type: 'string', raw: v }
  }
  return {
    name: v.name ?? '',
    url: $security.sanitizeUrl(v.url, ['http', 'https', 'blob']),
    removable: v.remove !== undefined ? v.remove !== false : removable,
    type: 'object',
    raw: v,
  }
}

/**
 * Builds the file factory API from resolved props and events. Composes
 * factories for validation, focus, and file input handling.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 *
 * @param props Resolved component props.
 * @param events Event emitter created by `defineEvents`.
 */
export function blueprint<TProps extends FileProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<FileEmits>
) {
  const context$ = useContext()
  const { t } = useLocale()
  const $security = useSecurity()

  const api = useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeDisabled())
    .use(makeInteraction())
    .use(makeData())
    .use(makeInput())
    .use(makeProvider())
    .build()

  const {
    model,
    onUserInput,
    inputRef,
    handleInput: baseHandleInput,
    touched,
    visited,
  } = api

  // `update` follows `ModelOfProps<TProps>`, which stays deferred while
  // `TProps` is unbound — the file model is known to be `FileModelOf` here.
  const update = api.update as (data: FileModelOf) => void

  // ============== COMPUTED ==============

  /**
   * The resolved button label text for the file input.
   */
  const text = useDynamicProp(
    'file',
    toRef(
      () =>
        props.text ??
        (props.multiple
          ? t('file_button_text_multiple')
          : t('file_button_text'))
    ),
    {
      localize: true,
    }
  )

  /**
   * The resolved icon identifier for the add button.
   */
  const addIcon = useDynamicProp('addIcon', props, {
    icon: true,
  })

  /**
   * The resolved icon identifier for the remove button.
   */
  const removeIcon = useDynamicProp('removeIcon', props, {
    icon: true,
  })

  /**
   * Normalized list of files derived from the current model value, used for
   * rendering the file list UI.
   */
  const fileList = computed<FileListItem[]>(() => {
    const val = model.value
    const removable = props.remove !== false

    if (val == null) return []

    if (Array.isArray(val)) {
      return val.map((v) => toFileListItem(v, removable, { $security }))
    }

    if (val instanceof File || typeof val === 'string' || isFileObject(val)) {
      return [toFileListItem(val, removable, { $security })]
    }

    return []
  })

  /**
   * Whether the file list contains at least one entry.
   */
  const hasFiles = computed(() => fileList.value.length > 0)

  // ============== METHODS ===============

  /**
   * Handles a new selection as a user initiated input — from the native file
   * input's event, or from a value passed in directly. From an event, the
   * selected files are appended to the current model (`multiple`) or replace
   * it, each one fired as `add`; a plain value becomes the model as-is. Marks
   * the element touched and visited (completing the picker dialog is the whole
   * interaction for a file input), then reports the user input so `validateOn`
   * and expression untracking apply.
   *
   * @param value The native input event, or the new model value.
   */
  const handleInput = (value: FileModelOf | Event) => {
    let next: FileModelOf
    let target: HTMLInputElement | undefined

    if (typeof Event !== 'undefined' && value instanceof Event) {
      target = value.target as HTMLInputElement
      const files = target?.files

      if (!files) return

      const newFiles = Array.from(files)
      const existing = model.value

      next = props.multiple
        ? [
            ...(Array.isArray(existing)
              ? existing
              : existing != null
                ? [existing]
                : []),
            ...newFiles,
          ]
        : (newFiles[0] ?? null)

      for (const file of newFiles) {
        events.fire('add', file, context$)
      }
    } else {
      // The `typeof Event` guard above keeps TS from narrowing this branch.
      next = value as FileModelOf
    }

    update(next)
    touched.value = true
    visited.value = true
    // The model already holds the update, so the base handler is a pure
    // user-input report; read the value back so the payload carries the
    // reactive-wrapped model files.
    baseHandleInput(model.value, target ? (value as Event) : undefined)

    if (target) target.value = ''
  }

  /**
   * Removes a file from the list by index and updates the model value.
   *
   * @param index The index of the file to remove.
   */
  const handleRemove = (index: number) => {
    const item = fileList.value[index]
    if (!item || !item.removable) return

    const val = model.value

    events.fire('remove', item.raw, context$)

    if (Array.isArray(val)) {
      const next = [...val]
      next.splice(index, 1)
      const value: FileModelOf = props.multiple ? next : (next[0] ?? null)
      update(value)
    } else {
      update(null)
    }

    onUserInput()
  }

  /**
   * Programmatically opens the native file picker by clicking the hidden file
   * input.
   */
  const triggerFileInput = () => {
    inputRef.value?.click()
  }

  return {
    ...api,
    fileList,
    hasFiles,
    text,
    addIcon,
    removeIcon,
    handleRemove,
    triggerFileInput,
    handleInput,
  }
}

/**
 * Default prop values for the file blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<FileProps>()({
  type: 'file',
  layout: true,
  multiple: false,
  disabled: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  showRequired: undefined,
  remove: true,
  add: true,
  addIcon: '$add',
  removeIcon: '$remove',
})
