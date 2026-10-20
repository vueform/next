<script
  setup
  lang="ts"
  generic="TSchema extends FormSchema | Record<string, any> = FormSchema"
>
/**
 * Local copy of VfForm of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  useConfig,
  useBlueprint,
  defineEvents,
  type FormSchema,
  type ResolvedPage,
  VfPassthrough,
  vdomPrime,
} from '@vueform/primevue'
import {
  defaults,
  blueprint,
  type VfFormEmits,
  type VfFormProps,
  type VfFormSlots,
} from '@vueform/primevue/components/VfForm'
import PrimeStepItem from 'primevue/stepitem'
import PrimeStepList from 'primevue/steplist'
import PrimeStepPanel from 'primevue/steppanel'
import PrimeStepPanels from 'primevue/steppanels'
import PrimeStepper from 'primevue/stepper'
import PrimeTab from 'primevue/tab'
import PrimeTabList from 'primevue/tablist'
import PrimeTabPanels from 'primevue/tabpanels'
import PrimeTabs from 'primevue/tabs'
import { computed, onMounted, ref, watch } from 'vue'

import FormNav from './FormNav.vue'
import FormStep from './FormStep.vue'

import '@vueform/primevue/form.css'
import '@vueform/primevue/utils.css'

const StepItem = vdomPrime(PrimeStepItem)
const StepList = vdomPrime(PrimeStepList)
const StepPanel = vdomPrime(PrimeStepPanel)
const StepPanels = vdomPrime(PrimeStepPanels)
const Stepper = vdomPrime(PrimeStepper)
const Tab = vdomPrime(PrimeTab)
const TabList = vdomPrime(PrimeTabList)
const TabPanels = vdomPrime(PrimeTabPanels)
const Tabs = vdomPrime(PrimeTabs)

defineOptions({ name: 'VfForm', inheritAttrs: false })
defineEmits<VfFormEmits<TSchema>>()

const props = withDefaults(defineProps<VfFormProps<TSchema>>(), defaults)
const events = defineEvents<VfFormEmits<TSchema>>()
const slots = defineSlots<VfFormSlots<TSchema>>()

const {
  api,
  parts,
  classes,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

const config = useConfig()

useClasses(
  ({ props, tokenClass, tokenCss, showErrors, errors, messages, pager }) => ({
    root: {
      'vf-form': true,
      [tokenClass]: !!tokenCss.value,
      [config.build.darkClass]: props.dark === true,
      [config.build.lightClass]: props.dark === false,
    },
    // Functional on purpose (same for `messages` below): the entries read
    // form-level aggregates, which must resolve in the part's own render
    // effect — never inside the merged classes computed, where elements' vapor
    // dynamic prop sources would pick them up as dependencies and close a
    // reactive cycle (errors -> element validation -> element props -> form
    // bindings) that Vue 3.6's dirty-check walk cannot terminate on.
    errors: () => [
      'vf-form-errors-wrapper',
      {
        'sr-only': !showErrors.value || Object.keys(errors.value).length === 0,
      },
    ],
    errorList: 'vf-form-errors',
    error: 'vf-form-error',
    messages: () => [
      'vf-form-messages-wrapper',
      {
        'sr-only': !messages.value.length,
      },
    ],
    messageList: 'vf-form-messages',
    message: 'vf-form-message',
    languages: 'vf-form-languages',
    tab: () => null,
    step: () => null,
    stepItem: () => null,
    stepPanel: () => null,
    vStepPanel: () => '',
    stepInner: (page: ResolvedPage) => ({
      'p-step': true,
      'p-step-active': page.name === pager.value?.page,
    }),
    stepHeader: () => 'p-step-header',
    stepNumber: () => 'p-step-number',
    stepIcon: (page: ResolvedPage) => ({
      [page.meta?.icon]: !!page.meta?.icon,
    }),
    stepTitle: () => 'p-step-title',
  })
)

useModifiers(({ props }) => ({
  root: {
    'data-stacked': props.stacked ? '' : undefined,
  },
}))

useA11y(({ errorsId, messagesId }) => ({
  errors: {
    id: errorsId.value,
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': 'true',
    tabindex: -1,
  },
  messages: {
    id: messagesId.value,
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    tabindex: -1,
  },
}))

const {
  multilingual,
  nav,
  stepped,
  nextLabel,
  backLabel,
  finishLabel,
  tabbed,
  progress,
  back,
  submits,
  vertical,
  navPos,
} = propRefs

const {
  resolvedSchema,
  tabs,
  steps,
  language,
  invalid,
  invalidLanguages,
  messages,
  languages,
  errorsId,
  messagesId,
  errors,
  tokenCss,
  nonce,
  pager,
  uid,
  handleSubmit,
} = api

const invalidLabels = computed(() =>
  [...invalidLanguages.value].map((l) => languages.value[l])
)

/**
 * Whether the form has been mounted. The vertical step panel teleport stays
 * disabled until then, so its targets are resolvable in the document.
 */
const isMounted = ref(false)

onMounted(() => (isMounted.value = true))

/**
 * Teleport target selector for the active vertical step panel, or `undefined`
 * while the teleport should stay disabled (non-vertical modes, before mount, or
 * before pages exist). Deriving the `to` prop from the same condition as
 * `disabled` ensures Vue re-resolves the target when the teleport activates.
 */
const stepPanelTarget = computed(() =>
  stepped.value && vertical.value && isMounted.value && steps.pages.length
    ? `#${uid.value}-step-panel-${steps.index}`
    : undefined
)

/**
 * Returns the teleport target element for the step panel at the given page
 * index.
 *
 * @param index The page index whose teleport target to look up.
 */
const stepPanelTargetEl = (index: number) =>
  document.getElementById(`${uid.value}-step-panel-${index}`)

/**
 * Returns the `.p-steppanel-content` element wrapping the teleport target of
 * the step panel at the given page index.
 *
 * @param index The page index whose panel content element to look up.
 */
const stepPanelContent = (index: number) =>
  stepPanelTargetEl(index)?.parentElement

/**
 * Removes any static visual snapshots left in a step panel after a previous
 * collapse transition.
 *
 * @param content The panel content element to clean up.
 */
const clearStepPanelSnapshots = (content: HTMLElement) => {
  content
    .querySelectorAll('[data-vf-step-snapshot]')
    .forEach((el) => el.remove())
}

/**
 * Pins the outgoing panel's height and inserts a static clone of its elements
 * so the collapse animation still shows the previous step's content after the
 * live nodes are teleported into the newly selected panel.
 *
 * @param index The page index of the panel being left.
 */
const snapshotOutgoingStepPanel = (index: number) => {
  const target = stepPanelTargetEl(index)
  const content = target?.parentElement
  if (!target || !content) return

  content.style.minHeight = `${content.offsetHeight}px`
  clearStepPanelSnapshots(content)

  const snapshot = target.cloneNode(true) as HTMLElement
  snapshot.removeAttribute('id')
  snapshot.dataset.vfStepSnapshot = ''
  snapshot.setAttribute('aria-hidden', 'true')
  snapshot.setAttribute('inert', '')
  snapshot.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))

  // cloneNode copies attributes, not live input values — sync them
  const sources = target.querySelectorAll('input, textarea, select')
  const clones = snapshot.querySelectorAll('input, textarea, select')
  sources.forEach((source, i) => {
    const clone = clones[i]
    if (!clone) return
    if (
      source instanceof HTMLInputElement &&
      (source.type === 'checkbox' || source.type === 'radio')
    ) {
      ;(clone as HTMLInputElement).checked = source.checked
    } else {
      ;(
        clone as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      ).value = (
        source as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      ).value
    }
  })

  target.after(snapshot)
}

/*
 * The vertical step panels collapse/expand by animating the grid row that
 * holds their content. Elements are teleported into the newly selected panel
 * the moment the step changes, so a pre-flush watcher pins the outgoing
 * panel's height and leaves a static DOM snapshot behind — otherwise the
 * collapse would animate an empty box. The incoming panel clears any leftover
 * pin/snapshot so it sizes naturally.
 */
watch(
  () => steps.index,
  (index, oldIndex) => {
    if (!stepped.value || !vertical.value || !isMounted.value) return

    if (oldIndex >= 0) snapshotOutgoingStepPanel(oldIndex)

    if (index >= 0) {
      const content = stepPanelContent(index)
      if (content) {
        content.style.minHeight = ''
        clearStepPanelSnapshots(content)
      }
    }
  }
)

const inputPart = computed(() => {
  return {
    'pt:pcToggleButton:root': (ctx: any) => ({
      invalid: invalidLabels.value.includes(ctx.props.onLabel),
    }),
  }
})

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <form v-else v-bind="bindings.root" @submit.prevent>
      <slot name="content" :context>
        <div
          :id="`${uid}-head`"
          v-if="tabbed || stepped"
          class="vf-passthrough"
        />
        <component
          v-else-if="outlets?.content"
          :is="outlets.content"
          :context
        />
        <component
          v-if="!outlets?.content"
          :is="tabbed ? Tabs : stepped ? Stepper : VfPassthrough"
          :linear="stepped ? true : undefined"
          :value="pager?.page"
          v-bind="tabbed ? bindings.tabsContainer : bindings.stepsContainer"
          @update:value="pager?.select"
        >
          <Teleport :to="`#${uid}-head`" defer :disabled="!tabbed && !stepped">
            <div v-bind="bindings.errors()">
              <slot name="errors" :errors :id="errorsId">
                <component
                  v-if="outlets?.errors"
                  :is="outlets.errors"
                  :errors
                  :id="errorsId"
                />
                <ul v-else v-bind="bindings.errorList">
                  <template v-for="(fieldErrors, path) in errors" :key="path">
                    <li
                      v-for="(error, i) in fieldErrors"
                      :key="`${path}-${i}`"
                      v-bind="bindings.error"
                    >
                      <slot name="error" :error :path>
                        <component
                          v-if="outlets?.error"
                          :is="outlets.error"
                          :error
                          :path
                        />
                        <template v-else>
                          {{ error }}
                        </template>
                      </slot>
                    </li>
                  </template>
                </ul>
              </slot>
            </div>

            <div v-bind="bindings.messages()">
              <slot name="messages" :messages :id="messagesId">
                <component
                  v-if="outlets?.messages"
                  :is="outlets.messages"
                  :messages
                  :id="messagesId"
                />
                <ul v-else v-bind="bindings.messageList">
                  <li
                    v-for="(message, i) in messages"
                    :key="i"
                    v-bind="bindings.message"
                  >
                    <slot name="message" :message>
                      <component
                        v-if="outlets?.message"
                        :is="outlets.message"
                        :message
                      />
                      <template v-else>
                        {{ message }}
                      </template>
                    </slot>
                  </li>
                </ul>
              </slot>
            </div>

            <slot
              v-if="multilingual"
              name="languages"
              :languages
              :language
              :invalid-languages
              :bindings="bindings.languages"
            >
              <component
                v-if="outlets?.languages"
                :is="outlets.languages"
                :languages
                :language
                :invalid-languages
                :bindings="bindings.languages"
              />
              <VfSelectButton
                v-else
                v-model="language"
                :layout="false"
                :allow-empty="false"
                name="__language___"
                :options="languages"
                detached
                v-bind="bindings.languages"
                :part:input="inputPart"
              />
            </slot>
          </Teleport>

          <slot
            v-if="tabbed"
            name="tabs"
            :pager="tabs"
            :bindings="bindings.tabs"
          >
            <component
              v-if="outlets?.tabs"
              :is="outlets?.tabs"
              :pager="tabs"
              :bindings="bindings.tabs"
            />
            <TabList v-else v-bind="bindings.tabs">
              <template v-for="page in tabs.pages" :key="page.name">
                <slot name="tab" :page :bindings="bindings.tab(page)">
                  <component
                    v-if="outlets?.tab"
                    :is="outlets.tab"
                    :page
                    :bindings="bindings.tab(page)"
                  >
                    {{ page.label }}
                  </component>
                  <Tab v-else :value="page.name" v-bind="bindings.tab(page)">
                    {{ page.label }}
                  </Tab>
                </slot>
              </template>
            </TabList>
          </slot>

          <slot
            v-if="stepped && progress"
            name="steps"
            :pager="steps"
            :bindings="bindings.steps"
          >
            <component
              v-if="outlets?.steps"
              :is="outlets?.steps"
              :pager="steps"
              :bindings="bindings.steps"
            />
            <template v-else-if="vertical">
              <template v-for="page in steps.pages" :key="page.name">
                <slot name="step" :page :bindings="bindings.step(page)">
                  <component
                    v-if="outlets?.step"
                    :is="outlets?.step"
                    :page
                    :bindings="bindings.step(page)"
                  />
                  <StepItem
                    v-else
                    :value="page.name"
                    v-bind="bindings.stepItem(page)"
                  >
                    <FormStep :page :classes :parts />
                    <StepPanel v-bind="bindings.stepPanel(page)">
                      <!-- Elements are teleported here from the single
                        render location below when this page is active -->
                      <div
                        :id="`${uid}-step-panel-${page.index}`"
                        class="vf-passthrough"
                      />
                      <FormNav
                        v-if="nav"
                        :pager="steps"
                        :next-label
                        :back-label
                        :finish-label
                        :back
                        :slots="outlets"
                        :parts
                        :classes
                        :position="navPos"
                      />
                    </StepPanel>
                  </StepItem>
                </slot>
              </template>
            </template>
            <StepList v-else v-bind="bindings.steps">
              <template v-for="page in steps.pages" :key="page.name">
                <slot name="step" :page :bindings="bindings.step(page)">
                  <component
                    v-if="outlets?.step"
                    :is="outlets?.step"
                    :page
                    :bindings="bindings.step(page)"
                  />
                  <FormStep
                    v-else
                    :page
                    :classes
                    :parts
                    :divider="page.name !== pager?.lastPage"
                  />
                </slot>
              </template>
            </StepList>
          </slot>

          <slot name="elements" :resolved-schema :pager>
            <!-- In vertical stepped mode elements render here once (so they
              register with the pager) and are teleported into the active
              StepPanel. The target must stay a string even while disabled:
              the server renderer silently renders NOTHING for a teleport
              with a falsy `to`, disabled or not, which drops every element
              from the SSR payload (and mismatches on hydration). -->
            <Teleport
              :to="stepPanelTarget ?? 'body'"
              :disabled="!stepPanelTarget"
            >
              <component
                :is="
                  tabbed
                    ? TabPanels
                    : stepped && !vertical
                      ? StepPanels
                      : VfPassthrough
                "
                v-bind="tabbed ? bindings.tabPanels : bindings.stepPanels"
              >
                <component
                  v-if="outlets?.elements"
                  :is="outlets?.elements"
                  :resolved-schema
                  :pager
                />
                <VfElements v-else v-bind="bindings.elements">
                  <slot :resolved-schema>
                    <component
                      v-if="outlets?.default"
                      :is="outlets.default"
                      :resolved-schema
                    />
                    <template v-else>
                      <component
                        :is="el.component"
                        v-for="el in resolvedSchema"
                        :key="el.props.name"
                        v-bind="el.props"
                      />
                    </template>
                  </slot>
                </VfElements>
              </component>
            </Teleport>
          </slot>

          <FormNav
            v-if="stepped && nav && !vertical"
            :pager="steps"
            :next-label
            :back-label
            :finish-label
            :back
            :slots="outlets"
            :parts
            :classes
            :position="navPos"
          />

          <button
            v-if="submits"
            :disabled="invalid"
            @click.prevent="handleSubmit"
          >
            Submit
          </button>
        </component>
      </slot>
    </form>
    <component v-if="tokenCss" :is="'style'" :nonce.attr="nonce">
      {{ tokenCss }}
    </component>
  </slot>
</template>
