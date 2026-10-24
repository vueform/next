<script setup lang="ts">
/**
 * Local copy of VfLayout of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  useLayoutClasses,
  useI18n,
  defineEvents,
  VfPassthrough,
  type HeadingProp,
  mergeClass,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfLayoutEmits,
  type VfLayoutProps,
  type VfLayoutSlots,
} from '@vueform/ui/components/VfLayout'
import { computed } from 'vue'

import '@vueform/ui/element.css'
import '@vueform/ui/input.css'
import '@vueform/ui/icon.css'
import '@vueform/ui/animation.css'
import '@vueform/ui/utils.css'
import '@vueform/ui/hr.css'
import '@vueform/ui/blockquote.css'

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

useClasses(api.el$.classes, {
  root: () => (api.tokenCss.value ? api.tokenClass : null),
})

useLayoutClasses({
  root: (opts: {
    spaceTop?: number
    spaceBottom?: number
    lineTop?: boolean
    lineBottom?: boolean
  }) => ({
    'vf-element': true,
    'vf-space-top-1': opts?.spaceTop === 1,
    'vf-space-top-2': opts?.spaceTop === 2,
    'vf-space-top-3': opts?.spaceTop === 3,
    'vf-space-bottom-1': opts?.spaceBottom === 1,
    'vf-space-bottom-2': opts?.spaceBottom === 2,
    'vf-space-bottom-3': opts?.spaceBottom === 3,
    'vf-line-top': !!opts?.lineTop,
    'vf-line-bottom': !!opts?.lineBottom,
  }),
  panel: 'vf-panel',
  labelGroup: (_heading: HeadingProp | undefined) => ({
    'vf-label-group': true,
  }),
  label: 'vf-label',
  required: 'vf-required',
  elementGroup: 'vf-element-group',
  elementWrapper: 'vf-element-wrapper',
  addonGroup: 'vf-addon-group',
  addonBefore: (_addon: unknown, _i: number) => null,
  addonAfter: (_addon: unknown, _i: number) => null,
  iconGroup: 'vf-icon-group',
  loading: 'vf-icon vf-icon-loading',
  help: 'vf-help',
  description: 'vf-description',
  errors: 'vf-errors',
  error: 'vf-error',
  messages: 'vf-messages',
  message: 'vf-message',
})

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

const { t } = useI18n()

const rootProps = computed(() => {
  if (el$.props.layout !== false) return undefined

  const tokenClass = tokenCss.value ? api.tokenClass : null

  const partRoot = api.el$.parts?.root()
  if (partRoot) {
    return {
      ...partRoot,
      class: mergeClass(
        mergeClass('vf-passthrough', tokenClass),
        partRoot.class
      ),
    }
  }

  if (tokenClass) {
    return { class: ['vf-passthrough', tokenClass] }
  }

  return undefined
})

const rootClasses = computed(() => [
  el$.classes.root(el$.props),
  tokenCss.value ? api.tokenClass : null,
])

const rootBindings = computed(() => el$.bindings.root(el$.props))

const hasIcons = computed(
  () =>
    !!(
      el$.outlets['icon-before'] ||
      el$.iconBefore ||
      el$.outlets['icon-after'] ||
      el$.iconAfter ||
      props.loading
    )
)

const hasAddon = computed(
  () =>
    props.addons !== false &&
    ((el$.addonable &&
      (!!(el$.outlets['addon-before'] || el$.addonsBefore.length) ||
        !!(el$.outlets['addon-after'] || el$.addonsAfter.length))) ||
      hasLanguageAddon.value)
)

const hasLanguageAddon = computed(
  () =>
    props.languages !== false &&
    el$.addonable &&
    ((!!el$.props.translate && el$.translatable) || !!el$.outlets.language)
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
            :is="hasAddon ? 'div' : VfPassthrough"
            :class="hasAddon ? el$.classes.addonGroup : undefined"
            v-bind="hasAddon ? el$.bindings.addonGroup() : undefined"
          >
            <!-- Addons before -->
            <template v-if="hasAddon && el$.addonable">
              <component
                v-if="el$.outlets['addon-before']"
                :is="el$.outlets['addon-before']"
              />
              <template v-else>
                <VfAddon
                  v-for="(addon, i) in el$.addonsBefore"
                  :key="`before-${i}`"
                  :addon
                  :class="el$.classes.addonBefore?.(addon, i)"
                  v-bind="el$.bindings.addonBefore(addon, i)"
                />
              </template>
            </template>

            <!-- Icon group -->
            <component
              :is="hasIcons ? 'div' : VfPassthrough"
              :class="hasIcons ? el$.classes.iconGroup : undefined"
              v-bind="hasIcons ? el$.bindings.iconGroup() : undefined"
            >
              <component
                v-if="el$.outlets['icon-before']"
                :is="el$.outlets['icon-before']"
                :icon-before="el$.iconBefore"
              />
              <VfIcon
                v-else-if="el$.iconBefore"
                :icon="el$.iconBefore"
                v-bind="el$.bindings.iconBefore()"
              />

              <slot />

              <span
                v-if="props.loading"
                :class="el$.classes.loading"
                v-bind="el$.bindings.loading()"
                aria-hidden="true"
              />
              <component
                v-else-if="el$.outlets['icon-after']"
                :is="el$.outlets['icon-after']"
                :icon-after="el$.iconAfter"
              />
              <VfIcon
                v-else-if="el$.iconAfter"
                :icon="el$.iconAfter"
                v-bind="el$.bindings.iconAfter()"
              />
            </component>

            <!-- Addons after -->
            <template v-if="hasAddon && el$.addonable">
              <component
                v-if="el$.outlets['addon-after']"
                :is="el$.outlets['addon-after']"
              />
              <template v-else>
                <VfAddon
                  v-for="(addon, i) in el$.addonsAfter"
                  :key="`after-${i}`"
                  :addon
                  :class="el$.classes.addonAfter?.(addon, i)"
                  v-bind="el$.bindings.addonAfter(addon, i)"
                />
              </template>
            </template>

            <!-- Language addon -->
            <template v-if="hasLanguageAddon">
              <component
                v-if="el$.outlets.language"
                :is="el$.outlets.language"
                :language="el$.language"
                :languages="el$.languages"
                v-bind="el$.bindings.language()"
              />
              <VfAddon
                v-else
                :addon="el$.translateAddon"
                v-bind="el$.bindings.language()"
              />
            </template>
          </component>
        </component>

        <span
          v-if="hasLanguageAddon"
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
          :class="el$.classes.panel"
          v-bind="el$.bindings.panel()"
        >
          <!-- Container -->
          <component
            :is="isFieldset ? 'fieldset' : 'div'"
            :class="[
              rootClasses,
              helperClasses('columns.container'),
              columnClasses.container,
            ]"
            :aria-labelledby="isFieldset && showLabel ? el$.labelId : undefined"
            :aria-label="isFieldset && !showLabel ? el$.genericName : undefined"
            :aria-describedby="
              isFieldset
                ? el$.bindings.input()?.['aria-describedby']
                : undefined
            "
            :hidden="(!hasPager && !el$.visible) || undefined"
            v-bind="rootBindings"
            v-show="el$.visible"
          >
            <!-- Label group -->
            <div
              v-if="showLabel"
              :class="[
                el$.classes.labelGroup(el$.props.heading),
                helperClasses('columns.label'),
                columnClasses.label,
              ]"
              v-bind="el$.bindings.labelGroup(el$.props.heading)"
            >
              <!-- Label -->
              <component
                v-if="el$.outlets.label"
                :is="el$.outlets.label"
                :for="useLabelTag ? el$.id : undefined"
                :id="el$.labelId"
                :tag="headingTag || (useLabelTag ? 'label' : 'span')"
                :label="el$.label"
                :bindings="el$.bindings.label()"
              />
              <component
                v-else
                :is="headingTag || (useLabelTag ? 'label' : 'span')"
                :for="useLabelTag ? el$.id : undefined"
                :id="el$.labelId"
                :class="el$.classes.label"
                v-bind="el$.bindings.label()"
              >
                {{ el$.label }}
              </component>

              <!-- Required -->
              <component
                v-if="showRequired && el$.outlets.required"
                :is="el$.outlets.required"
              />
              <span
                v-else-if="showRequired"
                aria-hidden="true"
                :class="el$.classes.required"
                v-bind="el$.bindings.required()"
              />

              <!-- Help -->
              <component
                v-if="showHelp && el$.outlets.help"
                :is="el$.outlets.help"
                :help="el$.help"
                :id="el$.helpId"
                :bindings="el$.bindings.help()"
              />
              <div
                v-else-if="showHelp"
                :id="el$.helpId"
                :class="el$.classes.help"
                v-bind="el$.bindings.help()"
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
                el$.classes.elementGroup,
                helperClasses('columns.12-wrapper'),
                columnClasses.group,
              ]"
              v-bind="el$.bindings.elementGroup()"
            >
              <!-- Tabs -->
              <component
                v-if="el$.props.tabbed"
                :is="el$.outlets.tabs || 'VfTabs'"
                :pager="el$.pager"
                v-bind="el$.bindings.tabs()"
              >
                <template #tab="tabProps">
                  <component
                    v-if="el$.outlets.tab"
                    :is="el$.outlets.tab"
                    v-bind="tabProps"
                  />
                </template>
              </component>

              <!-- Element wrapper -->
              <div
                :class="[
                  el$.classes.elementWrapper,
                  helperClasses('columns.wrapper'),
                  columnClasses.wrapper,
                ]"
                v-bind="el$.bindings.elementWrapper()"
              >
                <component
                  :is="hasAddon ? 'div' : VfPassthrough"
                  :class="hasAddon ? el$.classes.addonGroup : undefined"
                  v-bind="hasAddon ? el$.bindings.addonGroup() : undefined"
                >
                  <!-- Addons before -->
                  <template v-if="hasAddon && el$.addonable">
                    <component
                      v-if="el$.outlets['addon-before']"
                      :is="el$.outlets['addon-before']"
                    />
                    <template v-else>
                      <VfAddon
                        v-for="(addon, i) in el$.addonsBefore"
                        :key="`before-${i}`"
                        :addon
                        :class="el$.classes.addonBefore?.(addon, i)"
                        v-bind="el$.bindings.addonBefore(addon, i)"
                      />
                    </template>
                  </template>

                  <!-- Icon group -->
                  <component
                    :is="hasIcons ? 'div' : VfPassthrough"
                    :class="hasIcons ? el$.classes.iconGroup : undefined"
                    v-bind="hasIcons ? el$.bindings.iconGroup() : undefined"
                  >
                    <component
                      v-if="el$.outlets['icon-before']"
                      :is="el$.outlets['icon-before']"
                      :icon-before="el$.iconBefore"
                    />
                    <VfIcon
                      v-else-if="el$.iconBefore"
                      :icon="el$.iconBefore"
                      v-bind="el$.bindings.iconBefore()"
                    />

                    <slot />

                    <span
                      v-if="props.loading"
                      :class="el$.classes.loading"
                      v-bind="el$.bindings.loading()"
                      aria-hidden="true"
                    />
                    <component
                      v-else-if="el$.outlets['icon-after']"
                      :is="el$.outlets['icon-after']"
                      :icon-after="el$.iconAfter"
                    />
                    <VfIcon
                      v-else-if="el$.iconAfter"
                      :icon="el$.iconAfter"
                      v-bind="el$.bindings.iconAfter()"
                    />
                  </component>

                  <!-- Addons after -->
                  <template v-if="hasAddon && el$.addonable">
                    <component
                      v-if="el$.outlets['addon-after']"
                      :is="el$.outlets['addon-after']"
                    />
                    <template v-else>
                      <VfAddon
                        v-for="(addon, i) in el$.addonsAfter"
                        :key="`after-${i}`"
                        :addon
                        :class="el$.classes.addonAfter?.(addon, i)"
                        v-bind="el$.bindings.addonAfter(addon, i)"
                      />
                    </template>
                  </template>

                  <!-- Language addon -->
                  <template v-if="hasLanguageAddon">
                    <component
                      v-if="el$.outlets.language"
                      :is="el$.outlets.language"
                      :language="el$.language"
                      :languages="el$.languages"
                      v-bind="el$.bindings.language()"
                    />
                    <VfAddon
                      v-else
                      :addon="el$.translateAddon"
                      v-bind="el$.bindings.language()"
                    />
                  </template>
                </component>

                <span
                  v-if="
                    hasLanguageAddon && el$.props.translate && el$.translatable
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
                v-if="showDescription && el$.outlets.description"
                :is="el$.outlets.description"
                :description="el$.description"
                :id="el$.descriptionId"
                :bindings="el$.bindings.description()"
              />
              <div
                v-else-if="showDescription"
                :id="el$.descriptionId"
                :class="[el$.classes.description, columnClasses.full]"
                v-bind="el$.bindings.description()"
              >
                {{ el$.description }}
              </div>

              <!-- Errors -->
              <component
                v-if="showErrors && el$.outlets.errors"
                :is="el$.outlets.errors"
                :errors="el$.displayErrors"
                :bindings="el$.bindings.errors()"
              />
              <div
                v-else-if="showErrors"
                :id="el$.errorId"
                role="alert"
                :class="el$.classes.errors"
                v-bind="el$.bindings.errors()"
              >
                <div
                  v-for="error in el$.displayErrors"
                  :key="error"
                  :class="el$.classes.error"
                  v-bind="el$.bindings.error()"
                >
                  {{ error }}
                </div>
              </div>

              <!-- Messages -->
              <component
                v-if="el$.messages.length && el$.outlets.messages"
                :is="el$.outlets.messages"
                :messages="el$.messages"
              />
              <div
                v-else-if="el$.messages.length"
                :class="el$.classes.messages"
                v-bind="el$.bindings.messages()"
              >
                <div
                  v-for="message in el$.messages"
                  :key="message"
                  :class="el$.classes.message"
                  v-bind="el$.bindings.message()"
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
