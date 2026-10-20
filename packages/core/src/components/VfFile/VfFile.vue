<script setup lang="ts" generic="const TMultiple extends boolean = false">
import { inputAria } from '#src/a11y'
import { defaults, blueprint, type FileListItem } from '#src/blueprints/file'
import { useBlueprint, useLocale } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfFileEmits, VfFileProps, VfFileSlots } from './types'

defineOptions({
  name: 'VfFile',
  element: true,
  inheritAttrs: false,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<VfFileEmits<TMultiple>>()

const props = withDefaults(defineProps<VfFileProps<TMultiple>>(), defaults)
const events = defineEvents<VfFileEmits>()
const slots = defineSlots<VfFileSlots<TMultiple>>()

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  classes,
  useClasses,
  useBindings,
} = useBlueprint(blueprint, props, events, slots)

useClasses({
  root: 'vf-file',
  input: 'sr-only',
  list: 'vf-file-list',
  item: 'vf-file-item',
  name: 'vf-file-name',
  remove: 'vf-file-remove',
})

const { t } = useLocale()

useBindings(
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
