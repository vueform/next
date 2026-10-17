<script setup lang="ts">
import { defaults, blueprint } from '#src/blueprints/tabs'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfTabsEmits, VfTabsProps, VfTabsSlots } from './types'

defineOptions({ name: 'VfTabs' })
defineEmits<VfTabsEmits>()

const props = withDefaults(defineProps<VfTabsProps>(), defaults)
const events = defineEvents<VfTabsEmits>()
const slots = defineSlots<VfTabsSlots>()

const { parts, classes, context, expose, outlets, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

useClasses(() => ({
  root: 'vf-tabs',
  list: 'vf-tabs-wrapper',
  wrapper: ({
    selected,
    invalid,
  }: {
    selected: boolean
    invalid: boolean
  }) => ({
    'vf-tab-wrapper': true,
    'vf-selected': selected,
    'vf-invalid': invalid,
  }),
  tab: 'vf-tab',
}))

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="parts.root">
      <ul :class="classes.list" role="tablist" v-bind="parts.list">
        <template v-for="page in pager.pages" :key="page.pageId">
          <li
            v-if="page.available"
            :class="classes.wrapper(page)"
            role="none"
            v-bind="parts.wrapper?.(page)"
          >
            <button
              type="button"
              :class="classes.tab"
              :id="page.pageId"
              role="tab"
              :aria-selected="page.selected"
              :aria-current="page.selected"
              :aria-controls="page.panelId"
              :tabindex="page.tabindex"
              v-bind="parts.tab"
              @click="page.select"
              @keydown="page.keydown"
              @focus="page.focus"
              @blur="page.blur"
            >
              <slot v-bind="page">
                <component
                  v-if="outlets?.default"
                  :is="outlets.default"
                  v-bind="page"
                />
                <template v-else>
                  {{ page.label }}
                </template>
              </slot>
            </button>
          </li>
        </template>
      </ul>
    </div>
  </slot>
</template>
