<script setup lang="ts">
import { computed } from 'vue'

import { VfPassthrough } from '#core'
import { defaults, blueprint } from '#core/blueprints/layout'
import { useBlueprint, useLayoutClasses, useLocale } from '#core/composables'
import { defineEvents } from '#core/helpers'
import type { HeadingProp, UnknownElementParts } from '#core/types'
import { mergeClass } from '#core/utils'

import type { VfLayoutEmits, VfLayoutProps, VfLayoutSlots } from './types'

defineOptions({
  name: 'VfLayout',

  inheritAttrs: false,
})
defineEmits<VfLayoutEmits>()

const props = withDefaults(defineProps<VfLayoutProps>(), defaults)
const events = defineEvents<VfLayoutEmits>()
const slots = defineSlots<VfLayoutSlots>()

const { api, classes, context, expose, outlets, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

useClasses(
  api.el$.classes as any,
  () =>
    ({
      root: api.tokenCss.value ? api.tokenClass : null,
    }) as any
)

useLayoutClasses({
  root: ({
    spaceTop,
    spaceBottom,
    lineTop,
    lineBottom,
  }: {
    spaceTop?: number
    spaceBottom?: number
    lineTop?: boolean
    lineBottom?: boolean
  } = {}) => ({
    'vf-element': true,
    'vf-space-top-1': spaceTop === 1,
    'vf-space-top-2': spaceTop === 2,
    'vf-space-top-3': spaceTop === 3,
    'vf-space-bottom-1': spaceBottom === 1,
    'vf-space-bottom-2': spaceBottom === 2,
    'vf-space-bottom-3': spaceBottom === 3,
    'vf-line-top': !!lineTop,
    'vf-line-bottom': !!lineBottom,
  }),
  panel: 'vf-panel',
  labelGroup: (heading?: HeadingProp) => ({
    'vf-label-group': true,
    'vf-h1': heading === 1,
    'vf-h2': heading === 2,
    'vf-h3': heading === 3,
    'vf-h4': heading === 4,
    'vf-h5': heading === 5,
    'vf-h6': heading === 6,
  }),
  label: 'vf-label',
  required: 'vf-required',
  elementGroup: 'vf-element-group',
  elementWrapper: 'vf-element-wrapper',
  addonGroup: 'vf-addon-group',
  iconGroup: 'vf-icon-group',
  loading: 'vf-icon vf-icon-loading',
  help: 'vf-help',
  description: 'vf-description',
  errors: 'vf-errors',
  error: 'vf-error',
  messages: 'vf-messages',
  message: 'vf-message',
})

const parts = api.el$.parts as UnknownElementParts

const {
  el$,
  isFieldset,
  isContainer,
  hasPager,
  showRequired,
  showLabel,
  showSrLabel,
  showPhLabel,
  showHelp,
  showDescription,
  showErrors,
  useLabelTag,
  headingTag,
  columnClasses,
  tokenCss,
  nonce,
  helperClasses,
} = api

const elementSlots = el$.outlets

const { t } = useLocale()

/**
 * Whether the content needs an icon group wrapper (an icon on either side or a
 * loading spinner).
 */
const hasIcons = computed(
  () =>
    !!(
      elementSlots.iconBefore ||
      el$.iconBefore ||
      elementSlots.iconAfter ||
      el$.iconAfter ||
      props.loading
    )
)

const hasBeforeAddon = computed(
  () => el$.addonable && !!(elementSlots.addonBefore || el$.addonsBefore.length)
)

const hasAfterAddon = computed(
  () => el$.addonable && !!(elementSlots.addonAfter || el$.addonsAfter.length)
)

const hasLanguageAddon = computed(
  () =>
    props.languages !== false &&
    ((!!el$.props.translate && el$.translatable) || !!elementSlots.language)
)

/**
 * Whether an addon group wrapper is rendered around the content.
 */
const renderGroup = computed(
  () =>
    props.addons !== false &&
    (hasBeforeAddon.value || hasAfterAddon.value || hasLanguageAddon.value)
)

/**
 * Props for the passthrough root `<div>` rendered when the element has `layout:
 * false`, or `undefined` when no root wrapper is needed.
 */
const rootProps = computed(() => {
  if (el$.props.layout !== false) return undefined

  const tokenClass = tokenCss.value ? api.tokenClass : null

  if (parts.root) {
    return {
      ...parts.root,
      class: mergeClass(
        mergeClass('vf-passthrough', tokenClass),
        parts.root?.class
      ),
    }
  }

  if (tokenClass) {
    return { class: ['vf-passthrough', tokenClass] }
  }

  return undefined
})

const iconGroupProps = computed(() => ({
  ...parts.iconGroup,
  class: mergeClass(classes.iconGroup, parts.iconGroup?.class),
}))

const addonGroupProps = computed(() => ({
  ...parts.addonGroup,
  class: mergeClass(classes.addonGroup, parts.addonGroup?.class),
}))

/**
 * Resolves per-addon parts that may be defined as a function of the addon and
 * its index.
 */
const resolveAddonParts = (part: unknown, addon: any, i: number | string) =>
  typeof part === 'function' ? part(addon, i) : part

defineExpose(expose)
</script>

<template>
  <slot
    v-if="outlets.template || isContainer || el$.viewLoaded"
    name="template"
    :context
  >
    <component v-if="outlets.template" :is="outlets.template" :context />
    <template v-else-if="isContainer || el$.viewLoaded">
      <!-- TODO(bug): v-show on <template> is a no-op — el$.visible is never
        applied in the layout-less path. Pre-existing; fixing it changes
        runtime behavior (elements would start hiding), so it needs a
        deliberate decision + visual run. -->
      <!-- eslint-disable-next-line vue/valid-v-show, vue/no-useless-template-attributes -->
      <template v-if="el$.props.layout === false" v-show="el$.visible">
        <component :is="rootProps ? 'div' : VfPassthrough" v-bind="rootProps">
          <component
            :is="renderGroup ? 'div' : VfPassthrough"
            v-bind="renderGroup ? addonGroupProps : undefined"
          >
            <!-- Addons before -->
            <template v-if="renderGroup && el$.addonable">
              <component
                v-if="elementSlots.addonBefore"
                :is="elementSlots.addonBefore"
              />
              <template v-else>
                <VfAddon
                  v-for="(addon, i) in el$.addonsBefore"
                  :key="`before-${i}`"
                  :addon
                  v-bind="resolveAddonParts(parts.addonBefore, addon, i)"
                />
              </template>
            </template>

            <!-- Icon group -->
            <component
              :is="hasIcons ? 'div' : VfPassthrough"
              v-bind="hasIcons ? iconGroupProps : undefined"
            >
              <component
                v-if="elementSlots.iconBefore"
                :is="elementSlots.iconBefore"
                :icon-before="el$.iconBefore"
              />
              <VfIcon
                v-else-if="el$.iconBefore"
                :icon="el$.iconBefore"
                v-bind="parts.iconBefore"
              />

              <slot />

              <span
                v-if="props.loading"
                :class="classes.loading"
                aria-hidden="true"
              />
              <component
                v-else-if="elementSlots.iconAfter"
                :is="elementSlots.iconAfter"
                :icon-after="el$.iconAfter"
              />
              <VfIcon
                v-else-if="el$.iconAfter"
                :icon="el$.iconAfter"
                v-bind="parts.iconAfter"
              />
            </component>

            <!-- Addons after -->
            <template v-if="renderGroup && el$.addonable">
              <component
                v-if="elementSlots.addonAfter"
                :is="elementSlots.addonAfter"
              />
              <template v-else>
                <VfAddon
                  v-for="(addon, i) in el$.addonsAfter"
                  :key="`after-${i}`"
                  :addon
                  v-bind="resolveAddonParts(parts.addonAfter, addon, i)"
                />
              </template>
            </template>

            <!-- Language addon -->
            <template v-if="renderGroup && hasLanguageAddon">
              <component
                v-if="elementSlots.language"
                :is="elementSlots.language"
                :language="el$.language"
                :languages="el$.languages"
                v-bind="parts.language"
              />
              <VfAddon
                v-else
                :addon="el$.translateAddon"
                v-bind="parts.language"
              />
            </template>
          </component>
        </component>

        <span
          v-if="
            renderGroup &&
            hasLanguageAddon &&
            el$.props.translate &&
            el$.translatable
          "
          :id="el$.languageId"
          class="sr-only"
          aria-live="polite"
          >{{ t('sr_editing_language') }}:
          {{ el$.languages[el$.language] }}</span
        >
      </template>

      <template v-else>
        <component
          :is="hasPager ? 'div' : VfPassthrough"
          :class="classes.panel"
          :id="`${el$.name}__panel`"
          role="tabpanel"
          :aria-labelledby="`${el$.name}__tab`"
          :hidden="!el$.visible || undefined"
          :tabindex="0"
          v-bind="parts.panel"
        >
          <!-- Container -->
          <component
            :is="isFieldset ? 'fieldset' : 'div'"
            :class="[
              classes.root?.(el$.props as any),
              helperClasses('columns.container'),
              columnClasses.container,
            ]"
            :aria-labelledby="isFieldset && showLabel ? el$.labelId : undefined"
            :aria-label="isFieldset && !showLabel ? el$.genericName : undefined"
            :aria-describedby="
              isFieldset ? el$.aria?.['aria-describedby'] : undefined
            "
            :hidden="(!hasPager && !el$.visible) || undefined"
            v-bind="parts.root"
            v-show="el$.visible"
          >
            <!-- Label group -->
            <div
              v-if="showLabel"
              :class="[
                classes.labelGroup?.(el$.props.heading),
                helperClasses('columns.label'),
                columnClasses.label,
              ]"
              v-bind="parts.labelGroup"
            >
              <!-- Label -->
              <component
                v-if="elementSlots.label"
                :is="elementSlots.label"
                :for="useLabelTag ? el$.id : undefined"
                :id="el$.labelId"
                :class="classes.label"
                :tag="headingTag || (useLabelTag ? 'label' : 'span')"
                :label="el$.label"
                v-bind="parts.label"
              />
              <component
                v-else
                :is="headingTag || (useLabelTag ? 'label' : 'span')"
                :for="useLabelTag ? el$.id : undefined"
                :id="el$.labelId"
                :class="classes.label"
                v-bind="parts.label"
              >
                {{ el$.label }}
              </component>

              <!-- Required -->
              <component
                v-if="showRequired && elementSlots.required"
                :is="elementSlots.required"
              />
              <span
                v-else-if="showRequired"
                aria-hidden="true"
                :class="classes.required"
                v-bind="parts.required"
              />

              <!-- Help -->
              <component
                v-if="showHelp && elementSlots.help"
                :is="elementSlots.help"
                :help="el$.help"
                :id="el$.helpId"
                :class="classes.help"
                v-bind="parts.help"
              />
              <div
                v-else-if="showHelp"
                :id="el$.helpId"
                :class="classes.help"
                v-bind="parts.help"
              >
                {{ el$.help }}
              </div>
            </div>
            <template v-else>
              <!-- SR Label -->
              <label v-if="showSrLabel" :for="el$.id" class="sr-only">
                {{ el$.genericName }}
              </label>

              <!-- PH Label -->
              <div
                v-if="showPhLabel"
                :class="columnClasses.label"
                aria-hidden="true"
              />
            </template>

            <!-- Element group -->
            <div
              :class="[
                classes.elementGroup,
                helperClasses('columns.12-wrapper'),
                columnClasses.group,
              ]"
              v-bind="parts.elementGroup"
            >
              <!-- Tabs -->
              <component
                v-if="el$.props.tabbed"
                :is="elementSlots.tabs || 'VfTabs'"
                :pager="el$.pager"
                v-bind="parts.tabs"
              >
                <template #tab="tabProps">
                  <component
                    v-if="elementSlots.tab"
                    :is="elementSlots.tab"
                    v-bind="tabProps"
                  />
                </template>
              </component>

              <!-- Element wrapper -->
              <div
                :class="[
                  classes.elementWrapper,
                  helperClasses('columns.wrapper'),
                  columnClasses.wrapper,
                ]"
                v-bind="parts.elementWrapper"
              >
                <component
                  :is="renderGroup ? 'div' : VfPassthrough"
                  v-bind="renderGroup ? addonGroupProps : undefined"
                >
                  <!-- Addons before -->
                  <template v-if="renderGroup && el$.addonable">
                    <component
                      v-if="elementSlots.addonBefore"
                      :is="elementSlots.addonBefore"
                    />
                    <template v-else>
                      <VfAddon
                        v-for="(addon, i) in el$.addonsBefore"
                        :key="`before-${i}`"
                        :addon
                        v-bind="resolveAddonParts(parts.addonBefore, addon, i)"
                      />
                    </template>
                  </template>

                  <!-- Icon group -->
                  <component
                    :is="hasIcons ? 'div' : VfPassthrough"
                    v-bind="hasIcons ? iconGroupProps : undefined"
                  >
                    <component
                      v-if="elementSlots.iconBefore"
                      :is="elementSlots.iconBefore"
                      :icon-before="el$.iconBefore"
                    />
                    <VfIcon
                      v-else-if="el$.iconBefore"
                      :icon="el$.iconBefore"
                      v-bind="parts.iconBefore"
                    />

                    <slot />

                    <span
                      v-if="props.loading"
                      :class="classes.loading"
                      aria-hidden="true"
                    />
                    <component
                      v-else-if="elementSlots.iconAfter"
                      :is="elementSlots.iconAfter"
                      :icon-after="el$.iconAfter"
                    />
                    <VfIcon
                      v-else-if="el$.iconAfter"
                      :icon="el$.iconAfter"
                      v-bind="parts.iconAfter"
                    />
                  </component>

                  <!-- Addons after -->
                  <template v-if="renderGroup && el$.addonable">
                    <component
                      v-if="elementSlots.addonAfter"
                      :is="elementSlots.addonAfter"
                    />
                    <template v-else>
                      <VfAddon
                        v-for="(addon, i) in el$.addonsAfter"
                        :key="`after-${i}`"
                        :addon
                        v-bind="resolveAddonParts(parts.addonAfter, addon, i)"
                      />
                    </template>
                  </template>

                  <!-- Language addon -->
                  <template v-if="renderGroup && hasLanguageAddon">
                    <component
                      v-if="elementSlots.language"
                      :is="elementSlots.language"
                      :language="el$.language"
                      :languages="el$.languages"
                      v-bind="parts.language"
                    />
                    <VfAddon
                      v-else
                      :addon="el$.translateAddon"
                      v-bind="parts.language"
                    />
                  </template>
                </component>

                <span
                  v-if="
                    renderGroup &&
                    hasLanguageAddon &&
                    el$.props.translate &&
                    el$.translatable
                  "
                  :id="el$.languageId"
                  class="sr-only"
                  aria-live="polite"
                  >{{ t('sr_editing_language') }}:
                  {{ el$.languages[el$.language] }}</span
                >
              </div>

              <!-- Description -->
              <component
                v-if="showDescription && elementSlots.description"
                :is="elementSlots.description"
                :description="el$.description"
                :id="el$.descriptionId"
                :class="[classes.description, columnClasses.full]"
                v-bind="parts.description"
              />
              <div
                v-else-if="showDescription"
                :id="el$.descriptionId"
                :class="[classes.description, columnClasses.full]"
                v-bind="parts.description"
              >
                {{ el$.description }}
              </div>

              <!-- Errors -->
              <component
                v-if="showErrors && elementSlots.errors"
                :is="elementSlots.errors"
                :errors="el$.displayErrors"
              />
              <div
                v-else-if="showErrors"
                :class="classes.errors"
                :id="el$.errorId"
                role="alert"
                v-bind="parts.errors"
              >
                <div
                  v-for="error in el$.displayErrors"
                  :key="error"
                  :class="classes.error"
                  v-bind="parts.error"
                >
                  {{ error }}
                </div>
              </div>

              <!-- Messages -->
              <component
                v-if="el$.messages.length && elementSlots.messages"
                :is="elementSlots.messages"
                :messages="el$.messages"
              />
              <div
                v-else-if="el$.messages.length"
                :class="classes.messages"
                v-bind="parts.messages"
              >
                <div
                  v-for="message in el$.messages"
                  :key="message"
                  :class="classes.message"
                  v-bind="parts.message"
                >
                  {{ message }}
                </div>
              </div>
            </div>
          </component>
        </component>
      </template>
    </template>
  </slot>
  <component v-if="tokenCss" :is="'style'" :nonce.attr="nonce">
    {{ tokenCss }}
  </component>
</template>
