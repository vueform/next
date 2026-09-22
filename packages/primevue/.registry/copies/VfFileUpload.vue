<script setup lang="ts" generic="const TMultiple extends boolean = false">
/**
 * Local copy of VfFileUpload of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import PrimeFileUpload from 'primevue/fileupload'
import { blueprint, defaults } from '@vueform/primevue/blueprints/file-upload'
import type {
  VfFileUploadEmits,
  VfFileUploadProps,
  VfFileUploadSlots,
} from '@vueform/primevue/components/VfFileUpload'
import '@vueform/primevue/file-upload.css'

const FileUpload = vdomPrime(PrimeFileUpload)

defineOptions({ name: 'VfFileUpload', element: true, inheritAttrs: false })
defineEmits<VfFileUploadEmits<TMultiple>>()

const props = withDefaults(
  defineProps<VfFileUploadProps<TMultiple>>(),
  defaults
)
const events = defineEvents<VfFileUploadEmits<TMultiple>>()
const slots = defineSlots<VfFileUploadSlots<TMultiple>>()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ help }) => ({
  root: {
    'vf-file-upload': true,
    'vf-align-label': !help.value,
  },
  wrapper: {
    'vf-file-upload-wrapper': true,
    'vf-basic': props.mode === 'basic',
  },
}))

const { multiple, showUploadButton, mode } = propRefs

const {
  name,
  disabled,
  viewLoaded,
  input,
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
      <div :class="classes.wrapper">
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
          v-bind="{
            ...forwardProps,
            ...parts.input,
          }"
          :ref="(el) => (input = el)"
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
        <slot name="button" :upload>
          <component v-if="outlets?.button" :is="outlets.button" :upload />
          <VfButton
            v-else-if="showUpload"
            :name="`${name}__upload`"
            text="Upload"
            :layout="false"
            severity="secondary"
            v-bind="parts.button"
            @click="upload"
          />
        </slot>
      </div>
    </VfLayout>
  </slot>
</template>
