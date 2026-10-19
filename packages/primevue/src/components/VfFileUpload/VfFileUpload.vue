<script setup lang="ts" generic="const TMultiple extends boolean = false">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeFileUpload from 'primevue/fileupload'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/file-upload'
import { vdomPrime } from '#src/helpers'

import type {
  VfFileUploadEmits,
  VfFileUploadProps,
  VfFileUploadSlots,
} from './types'

const FileUpload = vdomPrime(PrimeFileUpload)

defineOptions({ name: 'VfFileUpload', element: true, inheritAttrs: false })
defineEmits<VfFileUploadEmits<TMultiple>>()

const props = withDefaults(
  defineProps<VfFileUploadProps<TMultiple>>(),
  defaults
)
const events = defineEvents<VfFileUploadEmits<TMultiple>>()
const slots = defineSlots<VfFileUploadSlots<TMultiple>>()

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-file-upload',
  wrapper: {
    'vf-file-upload-wrapper': true,
    'vf-basic': props.mode === 'basic',
  },
}))

useModifiers(({ hasError }) => ({
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

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

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <div v-bind="bindings.wrapper">
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
          v-bind="{ ...bindings.input, ...forwardProps }"
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
        <slot name="button" :upload :bindings="bindings.button">
          <component
            v-if="outlets?.button"
            :is="outlets.button"
            :upload
            :bindings="bindings.button"
          />
          <VfButton
            v-else-if="showUpload"
            :name="`${name}__upload`"
            text="Upload"
            :layout="false"
            severity="secondary"
            v-bind="bindings.button"
            @click="upload"
          />
        </slot>
      </div>
    </VfLayout>
  </slot>
</template>
