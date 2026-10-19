import {
  defineDefaults,
  useFeatures,
  makeElement,
  makeLayout,
  makeInteraction,
  makeDisabled,
  makeData,
  makeInput,
  makeForwards,
  makeProvider,
  useContext,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementA11y,
  type BaseElementModifiers,
  type BaseFieldElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type ValidationProps,
  type DisabledProps,
  type MultipleProps,
  type LayoutProps,
  type FileModelProp,
  type ModelEmits,
  type InteractionEmits,
  type ValidationEmits,
  type PlaceholderProps,
  makePlaceholder,
  type DProp,
  useDynamicProp,
  aliasProps,
  type InputEmits,
  type ModelApi,
} from '@vueform/core'
import type {
  FileUploadProps as AFileUploadProps,
  FileUploadEmitsOptions as AFileUploadEmits,
  FileUploadSelectEvent,
  FileUploadRemoveEvent,
  FileUploadRemoveUploadedFile,
} from 'primevue/fileupload'
import { computed } from 'vue'

import {
  makeInfo,
  type ModelPropsWithDefaultValue,
  type InfoProps,
} from '#src/features'
import type { ForwardedEmits } from '#src/types'

/**
 * The model value type carried by the file-upload element's wide props.
 */
type FileUploadModel = Required<FileUploadProps>['modelValue']

/**
 * Props for the file-upload element blueprint, parameterized by the
 * model-driving type argument (`multiple`). Plain usage (`FileUploadProps`)
 * keeps every member wide, so no separate plain-props alias is needed.
 *
 * - `multiple: false` — model is `File | null`
 * - `multiple: true` — model is `File[]`
 */
export interface FileUploadProps<
  T extends string = 'file-upload',
  TMultiple extends boolean = boolean,
  S = FileUploadSlots,
  P = FileUploadParts,
  C = FileUploadClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelPropsWithDefaultValue<FileModelProp<TMultiple>, TContext>,
    ValidationProps<TContext>,
    DisabledProps<TContext>,
    MultipleProps<TMultiple>,
    InfoProps,
    PlaceholderProps<TContext>,
    Pick<AFileUploadProps, 'mode' | 'showUploadButton'>,
    /* @vue-ignore */ Omit<
      AFileUploadProps,
      | 'name'
      | 'disabled'
      | 'multiple'
      | 'style'
      | 'class'
      | 'url'
      | 'accept'
      | 'maxFileSize'
      | 'fileLimit'
      | 'mode'
      | 'showUploadButton'
    > {
  /**
   * **This replaces the original PrimeVue `url` prop.** Remote url to upload
   * the files. Supports dynamic text props.
   *
   * @replaces url
   */
  url?: DProp<string, TContext>

  /**
   * **This replaces the original PrimeVue `accept` prop.** Pattern to restrict
   * the allowed file types such as `'image/*'`. Supports dynamic text props.
   *
   * @replaces accept
   */
  accept?: DProp<string, TContext>

  /**
   * **This replaces the original PrimeVue `maxFileSize` prop.** Maximum file
   * size allowed in bytes. Supports dynamic text props.
   *
   * @replaces maxFileSize
   */
  maxFileSize?: DProp<number, TContext>

  /**
   * **This replaces the original PrimeVue `fileLimit` prop.** Maximum number of
   * files that can be uploaded. Supports dynamic text props.
   *
   * @replaces fileLimit
   */
  fileLimit?: DProp<number, TContext>
}

/**
 * Events emitted by the file-upload element.
 */
export interface FileUploadEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<FileUploadModel, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<FileUploadModel, TContext>,
    /* @vue-ignore */ ForwardedEmits<
      AFileUploadEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the file-upload element blueprint.
 */
export interface FileUploadSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the file-upload element blueprint.
 */
export interface FileUploadParts extends BaseFieldElementParts {}

/**
 * CSS classes for the file-upload element blueprint.
 */
export interface FileUploadClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the file-upload element blueprint.
 */
export interface FileUploadModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the file-upload element blueprint.
 */
export interface FileUploadA11y extends BaseElementA11y {}

/**
 * Augmentable public API surface for file-upload-based components.
 */
export interface FileUploadExpose extends BaseElementExpose, FileUploadApi {}

/**
 * Factory API produced by the file-upload blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type FileUploadApi<
  TProps extends FileUploadProps<string> = FileUploadProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue FileUpload events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: [
    'select',
    'before-upload',
    'progress',
    'upload',
    'uploader',
    'error',
    'before-send',
    'remove',
    'removeUploadedFile',
  ],
  slots: [
    'empty',
    'header',
    'content',
    'chooseicon',
    'uploadicon',
    'cancelicon',
    'fileremoveicon',
    'filelabel',
  ],
} as const

/**
 * Builds the file-upload factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 *
 * @param props Element props.
 * @param events Typed emitters.
 */
export function blueprint<TProps extends FileUploadProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<FileUploadEmits>
) {
  const context$ = useContext()

  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makeData())
    .use(makeInput())
    .use(makeInfo())
    .use(makePlaceholder())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  const { clear, model, shouldValidate, validate, inputRef } = api

  // `TProps` is unbound — writes here use the wide file-upload model.
  const update = api.update as (data: FileUploadModel) => void

  /**
   * Whether the basic-mode upload button should be shown.
   */
  const showUpload = computed(
    () =>
      props.mode === 'basic' &&
      (props.showUploadButton || props.auto) &&
      (Array.isArray(model.value)
        ? model.value.some((f) => f instanceof File)
        : model.value instanceof File)
  )

  // @todo: this should be after useFeatures otherwise SELF("something_returned_by_deps")
  // expressions will not update
  /**
   * The resolved upload URL.
   */
  const url = useDynamicProp('url', props)

  /**
   * The resolved accepted file types pattern.
   */
  const accept = useDynamicProp('accept', props)

  /**
   * The resolved maximum number of files.
   */
  const fileLimit = useDynamicProp('fileLimit', props, {
    number: true,
  })

  /**
   * The resolved maximum file size in bytes.
   */
  const maxFileSize = useDynamicProp('maxFileSize', props, {
    number: true,
  })

  // =============== METHODS ==============

  /**
   * Handles the PrimeVue FileUpload select event, updating the model with the
   * selected files.
   *
   * @param event The select event from PrimeVue FileUpload.
   */
  const handleSelect = (event: FileUploadSelectEvent) => {
    const files: File[] = Array.from(event.files)
    const next = props.multiple ? files : (files[0] ?? null)
    update(next)
    events.fire('input', next, event.originalEvent, context$)
    if (shouldValidate.value) validate()
  }

  /**
   * Handles the PrimeVue FileUpload remove event, updating the model with the
   * remaining files.
   *
   * @param event The remove event from PrimeVue FileUpload.
   */
  const handleRemoveFile = (event: FileUploadRemoveEvent) => {
    const files: File[] = Array.from(event.files)
    const next = props.multiple ? files : (files[0] ?? null)
    update(next)
    events.fire('input', next, undefined, context$)
    if (shouldValidate.value) validate()
  }

  /**
   * Handles the PrimeVue FileUpload removeUploadedFile event.
   *
   * @param event The remove uploaded file event from PrimeVue FileUpload.
   */
  const handleRemoveUploadedFile = (_event: FileUploadRemoveUploadedFile) => {
    events.fire('input', model.value, undefined, context$)
  }

  /**
   * Handles the PrimeVue FileUpload clear event, resetting the model.
   */
  const handleClear = () => {
    clear()
    events.fire('input', null, undefined, context$)
    if (shouldValidate.value) validate()
  }

  /**
   * Programmatically triggers the PrimeVue FileUpload's upload method.
   */
  const upload = () => {
    inputRef.value?.upload()
  }

  return {
    ...api,
    url,
    accept,
    maxFileSize,
    fileLimit,
    showUpload,
    handleSelect,
    handleRemoveFile,
    handleRemoveUploadedFile,
    handleClear,
    upload,
  }
}

/**
 * Default prop values for the file-upload blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<FileUploadProps>()({
  type: 'file-upload',
  layout: true,
  multiple: false,
  disabled: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  showUploadButton: undefined,
  mode: 'advanced',
})
