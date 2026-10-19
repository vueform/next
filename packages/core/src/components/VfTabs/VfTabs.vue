<script setup lang="ts">
import { defaults, blueprint } from '#src/blueprints/tabs'
import { useBlueprint, type ResolvedPage } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfTabsEmits, VfTabsProps, VfTabsSlots } from './types'

defineOptions({ name: 'VfTabs' })
defineEmits<VfTabsEmits>()

const props = withDefaults(defineProps<VfTabsProps>(), defaults)
const events = defineEvents<VfTabsEmits>()
const slots = defineSlots<VfTabsSlots>()

const { context, expose, outlets, bindings, useClasses, useModifiers } =
  useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-tabs',
  list: 'vf-tabs-wrapper',
  wrapper: 'vf-tab-wrapper',
  tab: 'vf-tab',
}))

useModifiers(() => ({
  wrapper: (page: ResolvedPage) => ({
    'data-selected': page.selected ? '' : undefined,
    'data-invalid': page.invalid ? '' : undefined,
  }),
}))

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else v-bind="bindings.root">
      <ul role="tablist" v-bind="bindings.list">
        <template v-for="page in pager.pages" :key="page.pageId">
          <li v-if="page.available" role="none" v-bind="bindings.wrapper(page)">
            <button
              type="button"
              :id="page.pageId"
              role="tab"
              :aria-selected="page.selected"
              :aria-controls="page.panelId"
              :tabindex="page.tabindex"
              v-bind="bindings.tab"
              @click="page.select"
              @keydown="page.keydown"
              @focus="page.focus"
              @blur="page.blur"
            >
              <slot v-bind="page" :bindings="bindings.tab">
                <component
                  v-if="outlets?.default"
                  :is="outlets.default"
                  v-bind="page"
                  :bindings="bindings.tab"
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
