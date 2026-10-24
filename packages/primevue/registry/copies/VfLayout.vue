<script setup lang="ts">
/**
 * Local copy of VfLayout of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  useLayoutClasses,
  type HeadingProp,
  VfPassthrough,
  vTooltip,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfLayoutEmits,
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

const { api, context, expose, outlets, useClasses } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses(
  api.el$.classes as any,
  {
    root: () => (api.tokenCss.value ? api.tokenClass : null),
  } as any
)

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
  tab: (_page: unknown) => null,
  addonBefore: (_addon: unknown, _i: number) => null,
  addonAfter: (_addon: unknown, _i: number) => null,
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
  tokenClass,
  nonce,
  tags,
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
  setLanguage,
  helperClasses,
} = api

const labelWrapperProps = computed(() => {
  if (hasIfta.value) {
    return { ...el$.bindings?.iftaWrapper() }
  }

  if (hasFloat.value) {
    return {
      variant: el$.props.float || undefined,
      ...el$.bindings?.floatWrapper(),
    }
  }

  return undefined
})

const infoTooltipValue = computed(() => ({
  value: el$.info,
  class: classes.infoTooltip,
  autoHide: false,
}))

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
      <!-- TODO(bug): v-show on <template> is a no-op — el$.visible is never
        applied in the layout-less path. Pre-existing; fixing it changes
        runtime behavior (elements would start hiding), so it needs a
        deliberate decision + visual run. -->
      <!-- eslint-disable-next-line vue/valid-v-show, vue/no-useless-template-attributes -->
      <template v-if="el$.props.layout === false" v-show="el$.visible">
        <component :is="rootProps ? 'div' : VfPassthrough" v-bind="rootProps">
          <component
            :is="renderGroup ? InputGroup : VfPassthrough"
            v-bind="renderGroup ? el$.bindings?.addonGroup() : undefined"
          >
            <!-- Addons before -->
            <template v-if="renderGroup && el$.addonable">
              <component
                v-if="el$.outlets['addon-before']"
                :is="el$.outlets['addon-before']"
              />
              <template v-else>
                <VfAddon
                  v-for="(addon, i) in el$.addonsBefore"
                  :key="`before-${i}`"
                  :addon
                  :class="el$.classes?.addonBefore?.(addon, i)"
                  v-bind="el$.bindings?.addonBefore(addon, i)"
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
                v-bind="hasIcons ? el$.bindings?.iconGroup() : undefined"
              >
                <InputIcon
                  v-if="el$.outlets['icon-before']"
                  v-bind="el$.bindings?.iconBefore()"
                >
                  <component
                    :is="el$.outlets['icon-before']"
                    :icon-before="el$.iconBefore"
                  />
                </InputIcon>
                <InputIcon
                  v-else-if="el$.iconBefore"
                  :class="el$.iconBefore"
                  v-bind="el$.bindings?.iconBefore()"
                />

                <slot />

                <InputIcon
                  v-if="isLoading"
                  :class="el$.classes?.loading"
                  v-bind="el$.bindings?.loading()"
                  aria-hidden="true"
                />
                <InputIcon
                  v-else-if="el$.outlets['icon-after']"
                  v-bind="el$.bindings?.iconAfter()"
                >
                  <component
                    :is="el$.outlets['icon-after']"
                    :icon-after="el$.iconAfter"
                  />
                </InputIcon>
                <InputIcon
                  v-else-if="el$.iconAfter"
                  :class="el$.iconAfter"
                  v-bind="el$.bindings?.iconAfter()"
                />
              </component>

              <label
                v-if="hasLabelWrapper"
                :for="el$.id"
                v-bind="hasIfta ? el$.bindings?.ifta() : el$.bindings?.float()"
              >
                <component
                  v-if="hasIfta ? el$.outlets.ifta : el$.outlets['float-label']"
                  :is="hasIfta ? el$.outlets.ifta : el$.outlets['float-label']"
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
                v-if="el$.outlets['addon-after']"
                :is="el$.outlets['addon-after']"
              />
              <template v-else>
                <VfAddon
                  v-for="(addon, i) in el$.addonsAfter"
                  :key="`after-${i}`"
                  :addon
                  :class="el$.classes?.addonAfter?.(addon, i)"
                  v-bind="el$.bindings?.addonAfter(addon, i)"
                />
              </template>
            </template>

            <!-- Language addon -->
            <template v-if="renderGroup && hasLanguageAddon">
              <component
                v-if="el$.outlets.language"
                :is="el$.outlets.language"
                :language="el$.language"
                :languages="el$.languages"
                v-bind="el$.bindings?.language()"
              />
              <InputGroupAddon v-else>
                <PvSelect
                  :model-value="el$.language"
                  :options="languageOptions"
                  option-label="label"
                  option-value="code"
                  @update:model-value="setLanguage"
                  v-bind="el$.bindings?.language()"
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
          :value="hasPager ? el$.name : undefined"
          :class="el$.classes?.panel"
          v-bind="el$.bindings?.panel()"
        >
          <!-- Container -->
          <component
            :is="isFieldset ? 'fieldset' : 'div'"
            :class="[
              el$.classes.root(el$.props),
              tokenCss ? tokenClass : null,
              helperClasses('columns.container'),
              columnClasses.container,
            ]"
            :aria-labelledby="isFieldset && showLabel ? el$.labelId : undefined"
            :aria-label="isFieldset && !showLabel ? el$.genericName : undefined"
            :aria-describedby="
              isFieldset
                ? el$.bindings?.input()?.['aria-describedby']
                : undefined
            "
            :hidden="(!hasPager && !el$.visible) || undefined"
            v-bind="el$.bindings?.root(el$.props)"
            v-show="el$.visible"
          >
            <!-- Label group -->
            <div
              v-if="showLabel"
              :class="[
                el$.classes?.labelGroup?.(el$.props.heading),
                helperClasses('columns.label'),
                columnClasses.label,
              ]"
              v-bind="el$.bindings?.labelGroup(el$.props.heading)"
            >
              <!-- Label -->
              <component
                v-if="el$.outlets.label"
                :is="el$.outlets.label"
                :for="useLabelTag ? el$.id : undefined"
                :id="el$.labelId"
                :tag="headingTag || (useLabelTag ? 'label' : 'span')"
                :label="el$.label"
                :bindings="el$.bindings?.label()"
              />
              <component
                v-else
                :is="headingTag || (useLabelTag ? 'label' : 'span')"
                :for="useLabelTag ? el$.id : undefined"
                :id="el$.labelId"
                :class="el$.classes?.label"
                v-bind="el$.bindings?.label()"
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
                :class="el$.classes?.required"
                v-bind="el$.bindings?.required()"
              />
              <!-- Info -->
              <div
                v-if="el$.info || el$.outlets.info"
                v-tooltip:[infoTooltipArg]="infoTooltipValue"
                :class="el$.classes?.info"
                v-bind="el$.bindings?.info()"
              >
                <component
                  v-if="el$.outlets.info"
                  :is="el$.outlets.info"
                  :info="el$.info"
                />
                <span
                  v-else
                  :class="el$.classes?.infoIcon"
                  v-bind="el$.bindings?.infoIcon()"
                />
              </div>

              <!-- Help -->
              <component
                v-if="showHelp && el$.outlets.help"
                :is="el$.outlets.help"
                :help="el$.help"
                :id="el$.helpId"
                :bindings="el$.bindings?.help()"
              />
              <Message
                v-else-if="showHelp"
                size="small"
                severity="secondary"
                variant="simple"
                :id="el$.helpId"
                :class="el$.classes?.help"
                :pt="{ transition: { appear: false } }"
                v-bind="el$.bindings?.help()"
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
                el$.classes?.elementGroup,
                helperClasses('columns.12-wrapper'),
                columnClasses.group,
              ]"
              :value="el$.props.tabbed ? el$.pager.page : undefined"
              v-bind="{
                ...el$.bindings?.elementGroup(),
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
                :bindings="el$.bindings?.tabs()"
              >
                <!-- Tabs -->
                <component
                  :is="el$.outlets.tabs || TabList"
                  :pager="el$.outlets.tabs ? el$.pager : undefined"
                  v-bind="el$.bindings?.tabs()"
                >
                  <template v-for="page in el$.pager.pages" :key="page.name">
                    <slot name="tab" :page :bindings="el$.bindings?.tab(page)">
                      <component
                        :is="el$.outlets.tab || Tab"
                        :value="page.name"
                        v-bind="el$.bindings?.tab(page)"
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
                  el$.classes?.elementWrapper,
                  helperClasses('columns.wrapper'),
                  columnClasses.wrapper,
                ]"
                v-bind="el$.bindings?.elementWrapper()"
              >
                <component
                  :is="renderGroup ? InputGroup : VfPassthrough"
                  v-bind="renderGroup ? el$.bindings?.addonGroup() : undefined"
                >
                  <!-- Addons before -->
                  <template v-if="renderGroup && el$.addonable">
                    <component
                      v-if="el$.outlets['addon-before']"
                      :is="el$.outlets['addon-before']"
                    />
                    <template v-else>
                      <VfAddon
                        v-for="(addon, i) in el$.addonsBefore"
                        :key="`before-${i}`"
                        :addon
                        :class="el$.classes?.addonBefore?.(addon, i)"
                        v-bind="el$.bindings?.addonBefore(addon, i)"
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
                      v-bind="hasIcons ? el$.bindings?.iconGroup() : undefined"
                    >
                      <InputIcon
                        v-if="el$.outlets['icon-before']"
                        v-bind="el$.bindings?.iconBefore()"
                      >
                        <component
                          :is="el$.outlets['icon-before']"
                          :icon-before="el$.iconBefore"
                        />
                      </InputIcon>
                      <InputIcon
                        v-else-if="el$.iconBefore"
                        :class="el$.iconBefore"
                        v-bind="el$.bindings?.iconBefore()"
                      />

                      <slot />

                      <InputIcon
                        v-if="isLoading"
                        :class="el$.classes?.loading"
                        v-bind="el$.bindings?.loading()"
                        aria-hidden="true"
                      />
                      <InputIcon
                        v-else-if="el$.outlets['icon-after']"
                        v-bind="el$.bindings?.iconAfter()"
                      >
                        <component
                          :is="el$.outlets['icon-after']"
                          :icon-after="el$.iconAfter"
                        />
                      </InputIcon>
                      <InputIcon
                        v-else-if="el$.iconAfter"
                        :class="el$.iconAfter"
                        v-bind="el$.bindings?.iconAfter()"
                      />
                    </component>

                    <label
                      v-if="hasLabelWrapper"
                      :for="el$.id"
                      v-bind="
                        hasIfta ? el$.bindings?.ifta() : el$.bindings?.float()
                      "
                    >
                      <component
                        v-if="
                          hasIfta
                            ? el$.outlets.ifta
                            : el$.outlets['float-label']
                        "
                        :is="
                          hasIfta
                            ? el$.outlets.ifta
                            : el$.outlets['float-label']
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
                      v-if="el$.outlets['addon-after']"
                      :is="el$.outlets['addon-after']"
                    />
                    <template v-else>
                      <VfAddon
                        v-for="(addon, i) in el$.addonsAfter"
                        :key="`after-${i}`"
                        :addon
                        :class="el$.classes?.addonAfter?.(addon, i)"
                        v-bind="el$.bindings?.addonAfter(addon, i)"
                      />
                    </template>
                  </template>

                  <!-- Language addon -->
                  <template v-if="renderGroup && hasLanguageAddon">
                    <component
                      v-if="el$.outlets.language"
                      :is="el$.outlets.language"
                      :language="el$.language"
                      :languages="el$.languages"
                      v-bind="el$.bindings?.language()"
                    />
                    <InputGroupAddon v-else>
                      <PvSelect
                        :model-value="el$.language"
                        :options="languageOptions"
                        option-label="label"
                        option-value="code"
                        @update:model-value="setLanguage"
                        v-bind="el$.bindings?.language()"
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
                v-if="showDescription && el$.outlets.description"
                :is="el$.outlets.description"
                :description="el$.description"
                :id="el$.descriptionId"
                :bindings="el$.bindings?.description()"
              />
              <Message
                v-else-if="showDescription"
                size="small"
                severity="secondary"
                variant="simple"
                :id="el$.descriptionId"
                :class="[el$.classes?.description, columnClasses.full]"
                :pt="{ transition: { appear: false } }"
                v-bind="el$.bindings?.description()"
              >
                {{ el$.description }}
              </Message>

              <!-- Errors (PrimeVue Message) -->
              <component
                v-if="showErrors && el$.outlets.errors"
                :is="el$.outlets.errors"
                :errors="el$.displayErrors"
                :bindings="el$.bindings?.errors()"
              />
              <Message
                v-else-if="showErrors"
                :id="el$.errorId"
                :class="[el$.classes?.errors, columnClasses.full]"
                severity="error"
                variant="simple"
                size="small"
                v-bind="el$.bindings?.errors()"
              >
                <div
                  v-for="error in el$.displayErrors"
                  :key="error"
                  :class="el$.classes?.error"
                  v-bind="el$.bindings?.error()"
                >
                  {{ error }}
                </div>
              </Message>

              <!-- Messages -->
              <component
                v-if="el$.messages.length && el$.outlets.messages"
                :is="el$.outlets.messages"
                :messages="el$.messages"
              />
              <div
                v-else-if="el$.messages.length"
                :class="el$.classes?.messages"
                v-bind="el$.bindings?.messages()"
              >
                <div
                  v-for="message in el$.messages"
                  :key="message"
                  :class="el$.classes?.message"
                  v-bind="el$.bindings?.message()"
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
