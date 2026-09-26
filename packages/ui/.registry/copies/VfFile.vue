<script setup lang="ts" generic="const TMultiple extends boolean = false">
/**
 * Local copy of VfFile of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  type VfFileEmits,
  type VfFileProps,
  type VfFileSlots,
  defaults,
  blueprint,
} from '@vueform/ui/components/VfFile'
import { useBlueprint, defineEvents } from '@vueform/ui'
import '@vueform/ui/file.css'

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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: {
    'vf-file': true,
    'vf-align-label': !api.help.value,
  },
  input: 'sr-only',
  list: 'vf-file-list',
  item: 'vf-file-item',
  name: 'vf-file-name',
  remove: 'vf-file-remove',
}))

const { accept, multiple, capture, add } = propRefs

const {
  id,
  viewLoaded,
  disabled,
  aria,
  input,
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
      <div v-if="hasFiles" :class="classes.list" v-bind="parts.list">
        <template v-for="(file, index) in fileList" :key="index">
          <slot
            name="file"
            :value="file.raw"
            :fileName="file.name"
            :type="file.type"
            :url="file.url"
            :index
            :disabled
            :removable="file.removable"
            :remove="handleRemove"
          >
            <component
              v-if="outlets?.file"
              :is="outlets.file"
              :value="file.raw"
              :fileName="file.name"
              :type="file.type"
              :url="file.url"
              :index
              :disabled
              :removable="file.removable"
              :remove="handleRemove"
            />
            <div
              v-else
              :class="classes.item"
              v-bind="parts.item?.(file, index)"
            >
              <template v-if="file.removable">
                <slot name="remove" :index :disabled :remove="handleRemove">
                  <component
                    v-if="outlets?.remove"
                    :is="outlets.remove"
                    :index
                    :disabled
                    :remove="handleRemove"
                  />
                  <VfButton
                    v-else
                    :name="`${id}__remove_${index}`"
                    :icon="removeIcon"
                    :class="classes.remove"
                    :disabled
                    :layout="false"
                    v-bind="parts.remove?.(file, index)"
                    @click="handleRemove(index)"
                  />
                </slot>
              </template>
              <slot
                name="name"
                :value="file.raw"
                :fileName="file.name"
                :url="file.url"
                :type="file.type"
              >
                <component
                  v-if="outlets?.name"
                  :is="outlets.name"
                  :value="file.raw"
                  :fileName="file.name"
                  :url="file.url"
                  :type="file.type"
                />
                <a
                  v-else-if="file.url"
                  :href="file.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :class="classes.name"
                  v-bind="parts.name?.(file, index)"
                >
                  {{ file.name }}
                </a>
                <span v-else :class="classes.name" v-bind="parts.name">
                  {{ file.name }}
                </span>
              </slot>
            </div>
          </slot>
        </template>
      </div>
      <template v-if="add">
        <slot name="add" :triggerFileInput :disabled :text>
          <component
            v-if="outlets?.add"
            :is="outlets.add"
            :triggerFileInput
            :disabled
            :text
          />
          <VfButton
            v-else
            :name="`${name}__button`"
            :text
            :icon="addIcon"
            :disabled
            @click="triggerFileInput"
            v-bind="parts.add"
          />
        </slot>
        <input
          type="file"
          :name
          :id
          class="sr-only"
          :multiple
          :accept
          :capture
          v-bind="{
            ...parts.input,
            ...aria,
          }"
          :ref="(el) => (input = el)"
          @blur="handleBlur"
          @focus="handleFocus"
          @input="handleInput"
        />
      </template>
    </VfLayout>
  </slot>
</template>
