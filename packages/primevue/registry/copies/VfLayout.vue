<script setup lang="ts">
/**
 * Local copy of VfLayout of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  mergeClass,
  useBlueprint,
  useLayoutClasses,
  VfPassthrough,
  type HeadingProp,
  vTooltip,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfLayoutEmits,
  type VfLayoutParts,
  type VfLayoutProps,
  type VfLayoutSlots,
} from '@vueform/primevue/components/VfLayout'
import PrimeFloatLabel from 'primevue/floatlabel'
import PrimeIconField from 'primevue/iconfield'
import PrimeIftaLabel from 'primevue/iftalabel'
import PrimeInputGroup from 'primevue/inputgroup'
import PrimeInputGroupAddon from 'primevue/inputgroupaddon'
import PrimeInputIcon from 'primevue/inputicon'
import PrimeMessage from 'primevue/message'
import PrimeSelect from 'primevue/select'
import PrimeStepPanel from 'primevue/steppanel'
import PrimeTab from 'primevue/tab'
import PrimeTabList from 'primevue/tablist'
import PrimeTabPanel from 'primevue/tabpanel'
import PrimeTabPanels from 'primevue/tabpanels'
import PrimeTabs from 'primevue/tabs'
import { computed } from 'vue'

import '@vueform/primevue/blockquote.css'
import '@vueform/primevue/element.css'
import '@vueform/primevue/hr.css'
import '@vueform/primevue/icon.css'
import '@vueform/primevue/info.css'
import '@vueform/primevue/tooltip.css'

const FloatLabel = vdomPrime(PrimeFloatLabel)
const IconField = vdomPrime(PrimeIconField)
const IftaLabel = vdomPrime(PrimeIftaLabel)
const InputGroup = vdomPrime(PrimeInputGroup)
const InputGroupAddon = vdomPrime(PrimeInputGroupAddon)
const InputIcon = vdomPrime(PrimeInputIcon)
const Message = vdomPrime(PrimeMessage)
const PvSelect = vdomPrime(PrimeSelect)
const StepPanel = vdomPrime(PrimeStepPanel)
const Tab = vdomPrime(PrimeTab)
const TabList = vdomPrime(PrimeTabList)
const TabPanel = vdomPrime(PrimeTabPanel)
const TabPanels = vdomPrime(PrimeTabPanels)
const Tabs = vdomPrime(PrimeTabs)

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
  } = {}) => {
    return {
      'vf-element': true,
      'vf-space-top-1': spaceTop === 1,
      'vf-space-top-2': spaceTop === 2,
      'vf-space-top-3': spaceTop === 3,
      'vf-space-bottom-1': spaceBottom === 1,
      'vf-space-bottom-2': spaceBottom === 2,
      'vf-space-bottom-3': spaceBottom === 3,
      'vf-line-top': !!lineTop,
      'vf-line-bottom': !!lineBottom,
    }
  },
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
  tab: () => null,
  language: () => null,
  label: 'vf-label',
  required: 'vf-required',
  info: 'vf-info',
  infoIcon: 'pi pi-info-circle vf-info-icon',
  infoTooltip: 'vf-tooltip vf-info-tooltip',
  elementGroup: 'vf-element-group',
  elementWrapper: 'vf-element-wrapper',
  loading: 'pi pi-spin pi-spinner',
  help: 'vf-help',
  description: 'vf-description',
  errors: 'vf-errors',
  error: 'vf-error',
  messages: 'vf-messages',
  message: 'vf-message',
})

const parts = api.el$.parts as VfLayoutParts & Record<string, any>

const {
  el$,
  isFieldset,
  isContainer,
  hasPager,
  headingTag,
  showRequired,
  showLabel,
  showSrLabel,
  showPhLabel,
  showHelp,
  showDescription,
  showErrors,
  useLabelTag,
  columnClasses,
  tokenCss,
  nonce,
  helperClasses,
  tags,
  elementSlots,
  pager,
  infoTooltipArg,
  isLoading,
  hasIcons,
  hasLanguageAddon,
  renderGroup,
  hasFloat,
  hasIfta,
  hasLabelWrapper,
  rootProps,
  languageOptions,
  resolveAddonParts,
  setLanguage,
} = api

// Inline object literals with a `class` key break vapor SFC codegen; keep the
// tooltip binding as a computed instead.
const infoTooltipValue = computed(() => ({
  value: el$.info,
  class: classes.infoTooltip,
  autoHide: false,
}))

const iconGroupProps = computed(() => ({
  ...parts.iconGroup,
  class: mergeClass(classes.iconGroup, parts.iconGroup?.class),
}))

const addonGroupProps = computed(() => ({
  ...parts.addonGroup,
  class: mergeClass(classes.addonGroup, parts.addonGroup?.class),
}))

const labelWrapperProps = computed(() => {
  if (hasIfta.value) {
    return {
      ...(parts.iftaWrapper || {}),
      class: mergeClass(classes.iftaWrapper, parts.iftaWrapper?.class),
    }
  }

  if (hasFloat.value) {
    return {
      variant: el$.props.float || undefined,
      ...(parts.floatWrapper || {}),
      class: mergeClass(classes.floatWrapper, parts.floatWrapper?.class),
    }
  }

  return undefined
})

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
      <!-- Inline mode -->
      <template v-if="el$.props.layout === false" v-show="el$.visible">
        <component :is="rootProps ? 'div' : VfPassthrough" v-bind="rootProps">
          <component
            :is="renderGroup ? InputGroup : VfPassthrough"
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

            <!-- FloatLabel / IftaLabel -->
            <component
              :is="hasIfta ? IftaLabel : hasFloat ? FloatLabel : VfPassthrough"
              v-bind="labelWrapperProps"
            >
              <!-- Icon group -->
              <component
                :is="hasIcons ? IconField : VfPassthrough"
                v-bind="hasIcons ? iconGroupProps : undefined"
              >
                <InputIcon
                  v-if="elementSlots.iconBefore"
                  v-bind="parts.iconBefore"
                >
                  <component
                    :is="elementSlots.iconBefore"
                    :icon-before="el$.iconBefore"
                  />
                </InputIcon>
                <InputIcon
                  v-else-if="el$.iconBefore"
                  :class="el$.iconBefore"
                  v-bind="parts.iconBefore"
                />

                <slot />

                <InputIcon
                  v-if="isLoading"
                  :class="classes.loading"
                  aria-hidden="true"
                />
                <InputIcon
                  v-else-if="elementSlots.iconAfter"
                  v-bind="parts.iconAfter"
                >
                  <component
                    :is="elementSlots.iconAfter"
                    :icon-after="el$.iconAfter"
                  />
                </InputIcon>
                <InputIcon
                  v-else-if="el$.iconAfter"
                  :class="el$.iconAfter"
                  v-bind="parts.iconAfter"
                />
              </component>

              <label
                v-if="hasLabelWrapper"
                :for="el$.id"
                v-bind="hasIfta ? parts.ifta : parts.float"
                :class="hasIfta ? classes.ifta : classes.float"
              >
                <component
                  v-if="hasIfta ? elementSlots.ifta : elementSlots.floatLabel"
                  :is="hasIfta ? elementSlots.ifta : elementSlots.floatLabel"
                  v-bind="
                    hasIfta
                      ? { ifta: el$.ifta }
                      : { floatLabel: el$.floatLabel }
                  "
                />
                <template v-else>{{
                  hasIfta ? el$.ifta : el$.floatLabel
                }}</template>
              </label>
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
              <InputGroupAddon v-else>
                <PvSelect
                  :model-value="el$.language"
                  :options="languageOptions"
                  option-label="label"
                  option-value="code"
                  @update:model-value="setLanguage"
                  v-bind="parts.language"
                />
              </InputGroupAddon>
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
          >{{ tags.sr_editing_language }}:
          {{ el$.languages[el$.language] }}</span
        >
      </template>

      <!-- Normal mode -->
      <template v-else>
        <!-- Page panel -->
        <component
          :is="
            pager?.active
              ? pager.sequential
                ? (el$.form$ as any)?.props?.vertical === false
                  ? StepPanel
                  : VfPassthrough
                : TabPanel
              : VfPassthrough
          "
          :class="classes.panel"
          :value="hasPager ? el$.name : undefined"
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
            :aria-describedby="isFieldset ? el$.aria?.describedby : undefined"
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
              <!-- Info -->
              <div
                v-if="el$.info || elementSlots.info"
                :class="classes.info"
                v-tooltip:[infoTooltipArg]="infoTooltipValue"
                v-bind="parts.info"
              >
                <component
                  v-if="elementSlots.info"
                  :is="elementSlots.info"
                  :info="el$.info"
                />
                <span
                  v-else
                  :class="classes.infoIcon"
                  v-bind="parts.infoIcon"
                />
              </div>

              <!-- Help -->
              <component
                v-if="showHelp && elementSlots.help"
                :is="elementSlots.help"
                :help="el$.help"
                :id="el$.helpId"
                v-bind="parts.help"
              />
              <Message
                v-else-if="showHelp"
                size="small"
                severity="secondary"
                variant="simple"
                :id="el$.helpId"
                :pt="{ transition: { appear: false } }"
                v-bind="parts.help"
              >
                {{ el$.help }}
              </Message>
            </div>
            <template v-else>
              <!-- SR Label -->
              <component
                v-if="showSrLabel"
                :is="useLabelTag ? 'label' : 'span'"
                :for="el$.id"
                class="sr-only"
              >
                {{ el$.genericName }}
              </component>

              <!-- PH Label -->
              <div
                v-if="showPhLabel"
                :class="columnClasses.label"
                aria-hidden="true"
              />
            </template>

            <!-- Element group -->
            <component
              :is="el$.props.tabbed ? Tabs : 'div'"
              :class="[
                classes.elementGroup,
                helperClasses('columns.12-wrapper'),
                columnClasses.group,
              ]"
              :value="el$.props.tabbed ? el$.pager.page : undefined"
              v-bind="{
                ...parts.elementGroup,
                ...(el$.props.tabbed
                  ? {
                      'onUpdate:value': el$.pager.select,
                    }
                  : {}),
              }"
            >
              <slot
                v-if="el$.props.tabbed"
                name="tabs"
                :pager="el$.pager"
                :class="classes.tabs"
              >
                <!-- Tabs -->
                <component
                  :is="elementSlots.tabs || TabList"
                  :pager="elementSlots.tabs ? el$.pager : undefined"
                  :class="classes.tabs"
                  v-bind="parts.tabs"
                >
                  <template v-for="page in el$.pager.pages" :key="page.name">
                    <slot name="tab" :page :class="classes.tab?.(page)">
                      <component
                        :is="elementSlots.tab || Tab"
                        :value="page.name"
                        :class="classes.tab?.(page)"
                      >
                        {{ page.label }}
                      </component>
                    </slot>
                  </template>
                </component>
              </slot>

              <!-- Element wrapper -->
              <component
                :is="el$.props.tabbed ? TabPanels : 'div'"
                :class="[
                  classes.elementWrapper,
                  helperClasses('columns.wrapper'),
                  columnClasses.wrapper,
                ]"
                v-bind="parts.elementWrapper"
              >
                <component
                  :is="renderGroup ? InputGroup : VfPassthrough"
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

                  <!-- FloatLabel / IftaLabel -->
                  <component
                    :is="
                      hasIfta
                        ? IftaLabel
                        : hasFloat
                          ? FloatLabel
                          : VfPassthrough
                    "
                    v-bind="labelWrapperProps"
                  >
                    <!-- Icon group -->
                    <component
                      :is="hasIcons ? IconField : VfPassthrough"
                      v-bind="hasIcons ? iconGroupProps : undefined"
                    >
                      <InputIcon
                        v-if="elementSlots.iconBefore"
                        v-bind="parts.iconBefore"
                      >
                        <component
                          :is="elementSlots.iconBefore"
                          :icon-before="el$.iconBefore"
                        />
                      </InputIcon>
                      <InputIcon
                        v-else-if="el$.iconBefore"
                        :class="el$.iconBefore"
                        v-bind="parts.iconBefore"
                      />

                      <slot />

                      <InputIcon
                        v-if="isLoading"
                        :class="classes.loading"
                        aria-hidden="true"
                      />
                      <InputIcon
                        v-else-if="elementSlots.iconAfter"
                        v-bind="parts.iconAfter"
                      >
                        <component
                          :is="elementSlots.iconAfter"
                          :icon-after="el$.iconAfter"
                        />
                      </InputIcon>
                      <InputIcon
                        v-else-if="el$.iconAfter"
                        :class="el$.iconAfter"
                        v-bind="parts.iconAfter"
                      />
                    </component>

                    <label
                      v-if="hasLabelWrapper"
                      :for="el$.id"
                      v-bind="hasIfta ? parts.ifta : parts.float"
                      :class="hasIfta ? classes.ifta : classes.float"
                    >
                      <component
                        v-if="
                          hasIfta ? elementSlots.ifta : elementSlots.floatLabel
                        "
                        :is="
                          hasIfta ? elementSlots.ifta : elementSlots.floatLabel
                        "
                        v-bind="
                          hasIfta
                            ? { ifta: el$.ifta }
                            : { floatLabel: el$.floatLabel }
                        "
                      />
                      <template v-else>{{
                        hasIfta ? el$.ifta : el$.floatLabel
                      }}</template>
                    </label>
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
                    <InputGroupAddon v-else>
                      <PvSelect
                        :model-value="el$.language"
                        :options="languageOptions"
                        option-label="label"
                        option-value="code"
                        @update:model-value="setLanguage"
                        v-bind="parts.language"
                      />
                    </InputGroupAddon>
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
                  >{{ tags.sr_editing_language }}:
                  {{ el$.languages[el$.language] }}</span
                >
              </component>

              <!-- Description (PrimeVue Message) -->
              <component
                v-if="showDescription && elementSlots.description"
                :is="elementSlots.description"
                :description="el$.description"
                :id="el$.descriptionId"
                :class="columnClasses.full"
                v-bind="parts.description"
              />
              <Message
                v-else-if="showDescription"
                size="small"
                severity="secondary"
                variant="simple"
                :id="el$.descriptionId"
                :class="columnClasses.full"
                :pt="{ transition: { appear: false } }"
                v-bind="parts.description"
              >
                {{ el$.description }}
              </Message>

              <!-- Errors (PrimeVue Message) -->
              <component
                v-if="showErrors && elementSlots.errors"
                :is="elementSlots.errors"
                :errors="el$.displayErrors"
              />
              <Message
                v-else-if="showErrors"
                :id="el$.errorId"
                :class="columnClasses.full"
                severity="error"
                variant="simple"
                size="small"
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
              </Message>

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
            </component>
          </component>
        </component>
      </template>
    </template>
  </slot>
  <component v-if="tokenCss" :is="'style'" :nonce.attr="nonce">
    {{ tokenCss }}
  </component>
</template>
