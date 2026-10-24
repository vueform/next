<script setup lang="ts" generic="const TMultiple extends boolean = false">
/**
 * VfCloneName — a custom element created from Vueform's `file-upload` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  vdomPrime,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type ForwardedSlots,
  type PartBindings,
  type PartOf,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type FileUploadApi,
  type FileUploadClasses,
  type FileUploadEmits,
  type FileUploadExpose,
  type FileUploadParts,
  type FileUploadProps,
  type FileUploadSlots,
  type forwards,
} from '@vueform/primevue/blueprints/file-upload'
import PrimeFileUpload, {
  type FileUploadSlots as AFileUploadSlots,
  type FileUploadProps as PvFileUploadProps,
} from 'primevue/fileupload'

import '@vueform/primevue/file-upload.css'
import type { VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TMultiple extends boolean = boolean,
> extends FileUploadProps<
  '__TYPE__',
  TMultiple,
  VfCloneNameSlots<TMultiple>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TMultiple>>
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<
  TMultiple extends boolean = boolean,
> extends FileUploadEmits<VfCloneNameContext<VfCloneNameProps<TMultiple>>> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<TMultiple extends boolean = boolean>
  extends
    FileUploadSlots<VfCloneNameContext<VfCloneNameProps<TMultiple>>>,
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
    bindings: PartBindings<'button', VfCloneNameParts, VfFileUploadBindings>
  }) => VNode[]
}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends FileUploadParts {
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
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/primevue').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/primevue').ClassValue
 *
 * @see https://primevue.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends FileUploadClasses {
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
 * Custom exposed API members. Add props you return from useBlueprint's
 * 5th 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://primevue.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends FileUploadExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, FileUploadProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfFileUploadBindings,
  VfCloneNameExpose,
  FileUploadApi<TProps>
> {}

const FileUpload = vdomPrime(PrimeFileUpload)

defineOptions({ name: 'VfCloneName', element: true, inheritAttrs: false })
defineEmits<VfCloneNameEmits<TMultiple>>()

const props = withDefaults(defineProps<VfCloneNameProps<TMultiple>>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits<TMultiple>>()
const slots = defineSlots<VfCloneNameSlots<TMultiple>>()

/**
 * Extend the element's API by passing a 5th 'extend' callback to
 * useBlueprint — whatever it returns merges into the api / expose
 * (declare the members on VfCloneNameExpose above).
 *
 * @example
 *   useBlueprint(blueprint, props, events, slots, () => ({
 *     plain: '',
 *     vueRef: ref(''),
 *     method: (arg1: any, arg2: any) => '',
 *   }))
 *
 * @see https://primevue.vueform.com/guide/components#extending-the-logic
 */
const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
const classes = useClasses({
  root: 'vf-file-upload',
  wrapper: () => ({
    'vf-file-upload-wrapper': true,
    'vf-basic': props.mode === 'basic',
  }),
})

const bindings = useBindings(
  {
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  inputAria(api)
)

const { multiple, showUploadButton, mode } = propRefs

const {
  name,
  disabled,
  viewLoaded,
  inputRef,
  forwardProps,
  forwardSlots,
  showUpload,
  placeholder,
  url,
  accept,
  maxFileSize,
  fileLimit,
  id,
  upload,
  handleSelect,
  handleRemoveFile,
  handleRemoveUploadedFile,
  handleClear,
} = api

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry, EntryMultipleOf } from '@vueform/primevue'

type EntryProps<TEntry> = VfCloneNameProps<EntryMultipleOf<TEntry>>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<EntryMultipleOf<TEntry>>,
      VfCloneNameSlots,
      VfCloneNameParts,
      VfCloneNameClasses,
      VfCloneNameContext<EntryProps<TEntry>>
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCloneName: (typeof import('./VfCloneName.vue'))['default']
  }
}
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <div :class="classes.wrapper" v-bind="bindings.wrapper()">
        <FileUpload
          :name
          :disabled
          :multiple
          :url
          :accept
          :max-file-size
          :file-limit
          :mode
          :show-upload-button
          :input-id="id"
          :class="classes.input"
          v-bind="{ ...forwardProps, ...bindings.input() }"
          :ref="(el) => (inputRef = el)"
          @select="handleSelect"
          @remove="handleRemoveFile"
          @remove-uploaded-file="handleRemoveUploadedFile"
          @clear="handleClear"
        >
          <template
            v-for="(slot, slotName) in forwardSlots"
            :key="slotName"
            #[slotName]="scope"
          >
            <component :is="slot" v-bind="scope" />
          </template>
          <template #empty>
            <slot name="empty">
              <component v-if="outlets?.empty" :is="outlets.empty" />
              <template v-else>
                {{ placeholder }}
              </template>
            </slot>
          </template>
        </FileUpload>
        <slot name="button" :upload :bindings="bindings.button()">
          <component
            v-if="outlets?.button"
            :is="outlets.button"
            :upload
            :bindings="bindings.button()"
          />
          <VfButton
            v-else-if="showUpload"
            :name="`${name}__upload`"
            text="Upload"
            :layout="false"
            severity="secondary"
            v-bind="bindings.button()"
            @click="upload"
          />
        </slot>
      </div>
    </VfLayout>
  </slot>
</template>
