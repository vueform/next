<script setup lang="ts">
/**
 * Local copy of VfTabs of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfTabsEmits,
  type VfTabsProps,
  type VfTabsSlots,
} from '@vueform/ui/components/VfTabs'

import '@vueform/ui/tabs.css'

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
  wrapper: ({ selected, invalid }: { selected: boolean; invalid: boolean }) => [
    'vf-tab-wrapper',
    {
      'vf-selected': selected,
      'vf-invalid': invalid,
    },
  ],
  tab: 'vf-tab',
}))

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="parts.root">
      <ul :class="classes.list" role="tablist" v-bind="parts.list">
        <template v-for="page in pager.pages">
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
