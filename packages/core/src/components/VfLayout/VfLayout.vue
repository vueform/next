<script setup lang="ts">
import { computed } from 'vue'

import { defaults, blueprint } from '#src/blueprints/layout'
import { useBlueprint, useLayoutClasses, useLocale } from '#src/composables'
import { defineEvents } from '#src/helpers'
import { VfPassthrough } from '#src/tools'
import type { HeadingProp, UnknownElementParts } from '#src/types'
import { mergeClass } from '#src/utils'

import type { VfLayoutEmits, VfLayoutProps, VfLayoutSlots } from './types'

defineOptions({
  name: 'VfLayout',

  inheritAttrs: false,
})
defineEmits<VfLayoutEmits>()

const props = withDefaults(defineProps<VfLayoutProps>(), defaults)
const events = defineEvents<VfLayoutEmits>()
const slots = defineSlots<VfLayoutSlots>()

const { api, context, expose, outlets, useClasses } = useBlueprint(
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
  labelGroup: (_heading?: HeadingProp) => ({
    'vf-label-group': true,
  }),
  label: 'vf-label',
  required: 'vf-required',
  elementGroup: 'vf-element-group',
  elementWrapper: 'vf-element-wrapper',
  addonGroup: 'vf-addon-group',
  addonBefore: () => null,
  addonAfter: () => null,
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
      elementSlots['icon-before'] ||
      el$.iconBefore ||
      elementSlots['icon-after'] ||
      el$.iconAfter ||
      props.loading
    )
)

const hasBeforeAddon = computed(
  () =>
    el$.addonable && !!(elementSlots['addon-before'] || el$.addonsBefore.length)
)

const hasAfterAddon = computed(
  () =>
    el$.addonable && !!(elementSlots['addon-after'] || el$.addonsAfter.length)
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

/**
 * The token-driven root class, kept outside the element's `bindings.root` bag
 * because the scoped token CSS belongs to this VfLayout instance, not to the
 * element's class pipeline.
 */
const tokenRootClass = computed(() => (tokenCss.value ? api.tokenClass : null))

/**
 * Strips `class` from a resolved binding bag so the template can keep the
 * class-source order explicit (bag classes before the column classes) while
 * spreading the remaining attributes with `v-bind`.
 */
const withoutClass = (bag?: Record<string, any>) => {
  if (!bag) return undefined
  const { class: _class, ...attrs } = bag
  return attrs
}

/**
 * The element's resolved root bag; split into class and attrs at the binding
 * site to preserve class order next to the column classes.
 */
const rootBindings = computed(() => el$.bindings?.root(el$.props as any))

/**
 * The element's resolved label-group bag, resolved with the heading level.
 */
const labelGroupBag = computed(() =>
  el$.bindings?.labelGroup(el$.props.heading)
)

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
            v-bind="renderGroup ? el$.bindings?.addonGroup : undefined"
          >
            <!-- Addons before -->
            <template v-if="renderGroup && el$.addonable">
              <component
                v-if="elementSlots['addon-before']"
                :is="elementSlots['addon-before']"
              />
              <template v-else>
                <VfAddon
                  v-for="(addon, i) in el$.addonsBefore"
                  :key="`before-${i}`"
                  :addon
                  v-bind="el$.bindings?.addonBefore(addon, i)"
                />
              </template>
            </template>

            <!-- Icon group -->
            <component
              :is="hasIcons ? 'div' : VfPassthrough"
              v-bind="hasIcons ? el$.bindings?.iconGroup : undefined"
            >
              <component
                v-if="elementSlots['icon-before']"
                :is="elementSlots['icon-before']"
                :icon-before="el$.iconBefore"
              />
              <VfIcon
                v-else-if="el$.iconBefore"
                :icon="el$.iconBefore"
                v-bind="el$.bindings?.iconBefore"
              />

              <slot />

              <span
                v-if="props.loading"
                v-bind="el$.bindings?.loading"
                aria-hidden="true"
              />
              <component
                v-else-if="elementSlots['icon-after']"
                :is="elementSlots['icon-after']"
                :icon-after="el$.iconAfter"
              />
              <VfIcon
                v-else-if="el$.iconAfter"
                :icon="el$.iconAfter"
                v-bind="el$.bindings?.iconAfter"
              />
            </component>

            <!-- Addons after -->
            <template v-if="renderGroup && el$.addonable">
              <component
                v-if="elementSlots['addon-after']"
                :is="elementSlots['addon-after']"
              />
              <template v-else>
                <VfAddon
                  v-for="(addon, i) in el$.addonsAfter"
                  :key="`after-${i}`"
                  :addon
                  v-bind="el$.bindings?.addonAfter(addon, i)"
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
                v-bind="el$.bindings?.language"
              />
              <VfAddon
                v-else
                :addon="el$.translateAddon"
                v-bind="el$.bindings?.language"
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
          :id="`${el$.name}__panel`"
          role="tabpanel"
          :aria-labelledby="`${el$.name}__tab`"
          :hidden="!el$.visible || undefined"
          :tabindex="0"
          v-bind="el$.bindings?.panel"
        >
          <!-- Container -->
          <component
            :is="isFieldset ? 'fieldset' : 'div'"
            :class="[
              rootBindings?.class,
              tokenRootClass,
              helperClasses('columns.container'),
              columnClasses.container,
            ]"
            :aria-labelledby="isFieldset && showLabel ? el$.labelId : undefined"
            :aria-label="isFieldset && !showLabel ? el$.genericName : undefined"
            :aria-describedby="
              isFieldset
                ? el$.a11yBindings?.input?.['aria-describedby']
                : undefined
            "
            :hidden="(!hasPager && !el$.visible) || undefined"
            v-bind="withoutClass(rootBindings)"
            v-show="el$.visible"
          >
            <!-- Label group -->
            <div
              v-if="showLabel"
              :class="[
                labelGroupBag?.class,
                helperClasses('columns.label'),
                columnClasses.label,
              ]"
              v-bind="withoutClass(labelGroupBag)"
            >
              <!-- Label -->
              <component
                v-if="elementSlots.label"
                :is="elementSlots.label"
                :for="useLabelTag ? el$.id : undefined"
                :id="el$.labelId"
                :tag="headingTag || (useLabelTag ? 'label' : 'span')"
                :label="el$.label"
                :bindings="el$.bindings?.label"
              />
              <component
                v-else
                :is="headingTag || (useLabelTag ? 'label' : 'span')"
                :for="useLabelTag ? el$.id : undefined"
                :id="el$.labelId"
                v-bind="el$.bindings?.label"
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
                v-bind="el$.bindings?.required"
              />

              <!-- Help -->
              <component
                v-if="showHelp && elementSlots.help"
                :is="elementSlots.help"
                :help="el$.help"
                :id="el$.helpId"
                :bindings="el$.bindings?.help"
              />
              <div
                v-else-if="showHelp"
                :id="el$.helpId"
                v-bind="el$.bindings?.help"
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
                el$.bindings?.elementGroup?.class,
                helperClasses('columns.12-wrapper'),
                columnClasses.group,
              ]"
              v-bind="withoutClass(el$.bindings?.elementGroup)"
            >
              <!-- Tabs -->
              <component
                v-if="el$.props.tabbed"
                :is="elementSlots.tabs || 'VfTabs'"
                :pager="el$.pager"
                v-bind="el$.bindings?.tabs"
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
                  el$.bindings?.elementWrapper?.class,
                  helperClasses('columns.wrapper'),
                  columnClasses.wrapper,
                ]"
                v-bind="withoutClass(el$.bindings?.elementWrapper)"
              >
                <component
                  :is="renderGroup ? 'div' : VfPassthrough"
                  v-bind="renderGroup ? el$.bindings?.addonGroup : undefined"
                >
                  <!-- Addons before -->
                  <template v-if="renderGroup && el$.addonable">
                    <component
                      v-if="elementSlots['addon-before']"
                      :is="elementSlots['addon-before']"
                    />
                    <template v-else>
                      <VfAddon
                        v-for="(addon, i) in el$.addonsBefore"
                        :key="`before-${i}`"
                        :addon
                        v-bind="el$.bindings?.addonBefore(addon, i)"
                      />
                    </template>
                  </template>

                  <!-- Icon group -->
                  <component
                    :is="hasIcons ? 'div' : VfPassthrough"
                    v-bind="hasIcons ? el$.bindings?.iconGroup : undefined"
                  >
                    <component
                      v-if="elementSlots['icon-before']"
                      :is="elementSlots['icon-before']"
                      :icon-before="el$.iconBefore"
                    />
                    <VfIcon
                      v-else-if="el$.iconBefore"
                      :icon="el$.iconBefore"
                      v-bind="el$.bindings?.iconBefore"
                    />

                    <slot />

                    <span
                      v-if="props.loading"
                      v-bind="el$.bindings?.loading"
                      aria-hidden="true"
                    />
                    <component
                      v-else-if="elementSlots['icon-after']"
                      :is="elementSlots['icon-after']"
                      :icon-after="el$.iconAfter"
                    />
                    <VfIcon
                      v-else-if="el$.iconAfter"
                      :icon="el$.iconAfter"
                      v-bind="el$.bindings?.iconAfter"
                    />
                  </component>

                  <!-- Addons after -->
                  <template v-if="renderGroup && el$.addonable">
                    <component
                      v-if="elementSlots['addon-after']"
                      :is="elementSlots['addon-after']"
                    />
                    <template v-else>
                      <VfAddon
                        v-for="(addon, i) in el$.addonsAfter"
                        :key="`after-${i}`"
                        :addon
                        v-bind="el$.bindings?.addonAfter(addon, i)"
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
                      v-bind="el$.bindings?.language"
                    />
                    <VfAddon
                      v-else
                      :addon="el$.translateAddon"
                      v-bind="el$.bindings?.language"
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
                :bindings="{
                  ...el$.bindings?.description,
                  class: [el$.bindings?.description?.class, columnClasses.full],
                }"
              />
              <div
                v-else-if="showDescription"
                :id="el$.descriptionId"
                :class="[el$.bindings?.description?.class, columnClasses.full]"
                v-bind="withoutClass(el$.bindings?.description)"
              >
                {{ el$.description }}
              </div>

              <!-- Errors -->
              <component
                v-if="showErrors && elementSlots.errors"
                :is="elementSlots.errors"
                :errors="el$.displayErrors"
                :bindings="el$.bindings?.errors"
              />
              <div
                v-else-if="showErrors"
                :id="el$.errorId"
                role="alert"
                v-bind="el$.bindings?.errors"
              >
                <div
                  v-for="error in el$.displayErrors"
                  :key="error"
                  v-bind="el$.bindings?.error"
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
                v-bind="el$.bindings?.messages"
              >
                <div
                  v-for="message in el$.messages"
                  :key="message"
                  v-bind="el$.bindings?.message"
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
