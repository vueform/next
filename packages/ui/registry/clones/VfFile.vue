<script setup lang="ts" generic="const TMultiple extends boolean = false">
/**
 * VfCloneName — a custom element created from Vueform's `file` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  inputAria,
  useBlueprint,
  useI18n,
  defineEvents,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type FileProp,
  type PartOf,
  type WidenProps,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type FileListItem,
  type FileApi,
  type FileClasses,
  type FileEmits,
  type FileExpose,
  type FileParts,
  type FileProps,
  type FileSlots,
} from '@vueform/ui/blueprints/file'

import '@vueform/ui/file.css'
import type { VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TMultiple extends boolean = boolean,
> extends FileProps<
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
 * @see https://ui.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<
  TMultiple extends boolean = boolean,
> extends FileEmits<VfCloneNameContext<VfCloneNameProps<TMultiple>>> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<
  TMultiple extends boolean = boolean,
> extends FileSlots<VfCloneNameContext<VfCloneNameProps<TMultiple>>> {
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
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/ui').DomAttrsOf<'div'>
 *   component: import('@vueform/ui').PartOf<'VfButton'>
 *
 * @see https://ui.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends FileParts {
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
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/ui').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/ui').ClassValue
 *
 * @see https://ui.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends FileClasses {
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
 * Custom exposed API members. Add props you return from useBlueprint's
 * 5th 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://ui.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends FileExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, FileProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfFileBindings,
  VfCloneNameExpose,
  FileApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<VfCloneNameEmits<TMultiple>>()

const props = withDefaults(defineProps<VfCloneNameProps<TMultiple>>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits>()
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
 * @see https://ui.vueform.com/guide/components#extending-the-logic
 */
const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
const classes = useClasses({
  root: 'vf-file',
  input: 'sr-only',
  list: 'vf-file-list',
  item: 'vf-file-item',
  name: 'vf-file-name',
  remove: 'vf-file-remove',
})

const { t } = useI18n()

const bindings = useBindings(
  {
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
    remove: (_file: FileListItem, index: number) => ({
      'aria-label': t('sr_file_remove', { index: index + 1 }),
    }),
  },
  inputAria(api)
)

const { accept, multiple, capture, add } = propRefs

const {
  id,
  viewLoaded,
  disabled,
  inputRef,
  name,
  fileList,
  hasFiles,
  text,
  addIcon,
  removeIcon,
  handleRemove,
  triggerFileInput,
  handleFocus,
  handleBlur,
  handleInput,
} = api

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  EntryMultipleOf,
  ResolvedBindings,
} from '@vueform/ui'

type VfFileResolvedBindings = ResolvedBindings<VfCloneNameParts, VfFileBindings>

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
      <div v-if="hasFiles" :class="classes.list" v-bind="bindings.list()">
        <template v-for="(file, index) in fileList" :key="index">
          <slot
            name="file"
            :value="file.raw"
            :file-name="file.name"
            :type="file.type"
            :url="file.url"
            :index
            :disabled
            :removable="file.removable"
            :bindings="bindings.item(file, index)"
            :remove="handleRemove"
          >
            <component
              v-if="outlets?.file"
              :is="outlets.file"
              :value="file.raw"
              :file-name="file.name"
              :type="file.type"
              :url="file.url"
              :index
              :disabled
              :removable="file.removable"
              :bindings="bindings.item(file, index)"
              :remove="handleRemove"
            />
            <div
              v-else
              :class="classes.item"
              v-bind="bindings.item(file, index)"
            >
              <template v-if="file.removable">
                <slot
                  name="remove"
                  :index
                  :disabled
                  :bindings="bindings.remove(file, index)"
                  :remove="handleRemove"
                >
                  <component
                    v-if="outlets?.remove"
                    :is="outlets.remove"
                    :index
                    :disabled
                    :bindings="bindings.remove(file, index)"
                    :remove="handleRemove"
                  />
                  <VfButton
                    v-else
                    :name="`${id}__remove_${index}`"
                    :icon="removeIcon"
                    :disabled
                    :layout="false"
                    :class="classes.remove"
                    v-bind="bindings.remove(file, index)"
                    @click="handleRemove(index)"
                  />
                </slot>
              </template>
              <slot
                name="name"
                :value="file.raw"
                :file-name="file.name"
                :url="file.url"
                :type="file.type"
                :bindings="bindings.name(file, index)"
              >
                <component
                  v-if="outlets?.name"
                  :is="outlets.name"
                  :value="file.raw"
                  :file-name="file.name"
                  :url="file.url"
                  :type="file.type"
                  :bindings="bindings.name(file, index)"
                />
                <a
                  v-else-if="file.url"
                  :href="file.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :class="classes.name"
                  v-bind="bindings.name(file, index)"
                >
                  {{ file.name }}
                </a>
                <span
                  v-else
                  :class="classes.name"
                  v-bind="bindings.name(file, index)"
                >
                  {{ file.name }}
                </span>
              </slot>
            </div>
          </slot>
        </template>
      </div>
      <template v-if="add">
        <slot
          name="add"
          :disabled
          :text
          :bindings="bindings.add()"
          :trigger-file-input
        >
          <component
            v-if="outlets?.add"
            :is="outlets.add"
            :disabled
            :text
            :bindings="bindings.add()"
            :trigger-file-input
          />
          <VfButton
            v-else
            :name="`${name}__button`"
            :text
            :icon="addIcon"
            :disabled
            @click="triggerFileInput"
            v-bind="bindings.add()"
          />
        </slot>
        <input
          type="file"
          :name
          :id
          :multiple
          :accept
          :capture
          :class="classes.input"
          v-bind="bindings.input()"
          :ref="(el) => (inputRef = el)"
          @blur="handleBlur"
          @focus="handleFocus"
          @input="handleInput"
        />
      </template>
    </VfLayout>
  </slot>
</template>
