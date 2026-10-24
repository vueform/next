<script setup lang="ts">
/**
 * Local copy of VfTabs of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  useConfig,
  type ResolvedPage,
  useElementContext,
  defineEvents,
} from '@vueform/ui'
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

const { context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const el$ = useElementContext()
const config = useConfig()

const classes = useClasses({
  root: {
    'vf-tabs': true,
    [config.cols(12)]: !!el$,
  },
  list: 'vf-tabs-wrapper',
  wrapper: 'vf-tab-wrapper',
  tab: 'vf-tab',
})

const bindings = useBindings({
  wrapper: (page: ResolvedPage) => ({
    'data-selected': page.selected ? '' : undefined,
    'data-invalid': page.invalid ? '' : undefined,
  }),
})

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <div v-else :class="classes.root" v-bind="bindings.root()">
      <ul role="tablist" :class="classes.list" v-bind="bindings.list()">
        <template v-for="page in pager.pages" :key="page.pageId">
          <li
            v-if="page.available"
            role="none"
            :class="classes.wrapper"
            v-bind="bindings.wrapper(page)"
          >
            <button
              type="button"
              :id="page.pageId"
              role="tab"
              :aria-selected="page.selected"
              :aria-controls="page.panelId"
              :tabindex="page.tabindex"
              :class="classes.tab"
              v-bind="bindings.tab()"
              @click="page.select"
              @keydown="page.keydown"
              @focus="page.focus"
              @blur="page.blur"
            >
              <slot v-bind="page" :bindings="bindings.tab()">
                <component
                  v-if="outlets?.default"
                  :is="outlets.default"
                  v-bind="page"
                  :bindings="bindings.tab()"
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
