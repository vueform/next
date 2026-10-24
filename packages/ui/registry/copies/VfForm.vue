<script
  setup
  lang="ts"
  generic="TSchema extends FormSchema | Record<string, any> = FormSchema"
>
/**
 * Local copy of VfForm of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useConfig,
  useBlueprint,
  defineEvents,
  type FormSchema,
} from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfFormEmits,
  type VfFormProps,
  type VfFormSlots,
} from '@vueform/ui/components/VfForm'

import '@vueform/ui/form.css'

defineOptions({ name: 'VfForm', inheritAttrs: false })
defineEmits<VfFormEmits<TSchema>>()

const props = withDefaults(defineProps<VfFormProps<TSchema>>(), defaults)
const events = defineEvents<VfFormEmits<TSchema>>()
const slots = defineSlots<VfFormSlots<TSchema>>()

const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

const config = useConfig()

const classes = useClasses({
  root: () => ({
    'vf-form': true,
    [api.tokenClass]: !!api.tokenCss.value,
    [config.build.darkClass]: props.dark === true,
    [config.build.lightClass]: props.dark === false,
  }),
  errors: () => ({
    'vf-form-errors-wrapper': true,
    'sr-only':
      !api.showErrors.value || Object.keys(api.errors.value).length === 0,
  }),
  errorList: 'vf-form-errors',
  error: 'vf-form-error',
  messages: 'vf-form-messages-wrapper',
  messageList: 'vf-form-messages',
  message: 'vf-form-message',
})

const bindings = useBindings({
  root: () => ({
    'data-stacked': api.props.stacked ? '' : undefined,
  }),
  errors: () => ({
    id: api.errorsId.value,
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': 'true',
    tabindex: -1,
  }),
  messages: () => ({
    id: api.messagesId.value,
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    tabindex: -1,
  }),
})

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
  navPos,
} = propRefs

const {
  showErrors,
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
  selectLanguage,
  handleSubmit,
} = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <form v-else :class="classes.root" v-bind="bindings.root()" @submit.prevent>
      <slot name="content" :context>
        <component v-if="outlets?.content" :is="outlets.content" :context />
        <template v-else>
          <template v-if="showErrors">
            <slot
              name="errors"
              :errors
              :id="errorsId"
              :bindings="bindings.errors()"
            >
              <component
                v-if="outlets?.errors"
                :is="outlets.errors"
                :errors
                :id="errorsId"
                :bindings="bindings.errors()"
              />
              <div v-else :class="classes.errors" v-bind="bindings.errors()">
                <ul :class="classes.errorList" v-bind="bindings.errorList()">
                  <template v-for="(fieldErrors, path) in errors" :key="path">
                    <li
                      v-for="(error, i) in fieldErrors"
                      :key="`${path}-${i}`"
                      :class="classes.error"
                      v-bind="bindings.error()"
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
              </div>
            </slot>
          </template>

          <template v-if="messages.length">
            <slot
              name="messages"
              :messages
              :id="messagesId"
              :bindings="bindings.messages()"
            >
              <component
                v-if="outlets?.messages"
                :is="outlets.messages"
                :messages
                :id="messagesId"
                :bindings="bindings.messages()"
              />
              <div
                v-else
                :class="classes.messages"
                v-bind="bindings.messages()"
              >
                <ul
                  :class="classes.messageList"
                  v-bind="bindings.messageList()"
                >
                  <li
                    v-for="(message, i) in messages"
                    :key="i"
                    :class="classes.message"
                    v-bind="bindings.message()"
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
              </div>
            </slot>
          </template>

          <slot
            v-if="multilingual"
            name="languages"
            :languages
            :language
            :invalid-languages
            :select="selectLanguage"
            :bindings="bindings.languages()"
          >
            <component
              v-if="outlets.languages"
              :is="outlets.languages"
              :languages
              :language
              :invalid-languages
              :select="selectLanguage"
              :bindings="bindings.languages()"
            >
              <template v-if="outlets.language" #default="slotProps">
                <slot name="language" v-bind="slotProps">
                  <component :is="outlets.language" v-bind="slotProps" />
                </slot>
              </template>
            </component>
            <VfLanguages
              v-else
              :languages
              :language
              :invalid-languages
              :select="selectLanguage"
              v-bind="bindings.languages()"
            >
              <template v-if="outlets.language" #default="slotProps">
                <slot name="language" v-bind="slotProps">
                  <component :is="outlets.language" v-bind="slotProps" />
                </slot>
              </template>
            </VfLanguages>
          </slot>

          <slot
            v-if="tabbed"
            name="tabs"
            :pager="tabs"
            :bindings="bindings.tabs()"
          >
            <component
              v-if="outlets?.tabs"
              :is="outlets?.tabs"
              :pager="tabs"
              :bindings="bindings.tabs()"
            >
              <template v-if="outlets.tab" #default="slotProps">
                <slot name="tab" v-bind="slotProps">
                  <component
                    v-if="outlets?.tab"
                    :is="outlets.tab"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
            </component>
            <VfTabs v-else :pager="tabs" v-bind="bindings.tabs()">
              <template v-if="outlets.tab" #default="slotProps">
                <slot name="tab" v-bind="slotProps">
                  <component
                    v-if="outlets?.tab"
                    :is="outlets.tab"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
            </VfTabs>
          </slot>

          <slot
            v-if="stepped && progress"
            name="steps"
            :pager="steps"
            :bindings="bindings.steps()"
          >
            <component
              v-if="outlets?.steps"
              :is="outlets?.steps"
              :pager="steps"
              :bindings="bindings.steps()"
            >
              <template v-if="slots.step || outlets?.step" #default="slotProps">
                <slot name="step" v-bind="slotProps">
                  <component
                    v-if="outlets?.step"
                    :is="outlets.step"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
            </component>
            <VfSteps v-else :pager="steps" v-bind="bindings.steps()">
              <template v-if="slots.step || outlets?.step" #default="slotProps">
                <slot name="step" v-bind="slotProps">
                  <component
                    v-if="outlets?.step"
                    :is="outlets.step"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
            </VfSteps>
          </slot>

          <slot name="elements" :resolved-schema>
            <component :is="outlets?.elements || 'VfElements'" :resolved-schema>
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
            </component>
          </slot>

          <slot
            v-if="stepped && nav"
            name="nav"
            :pager="steps"
            :next="nextLabel"
            :back="backLabel"
            :finish="finishLabel"
            :hide-back="!back"
            :position="navPos"
            v-bind="bindings.nav()"
          >
            <component
              :is="outlets?.nav || 'VfNav'"
              :pager="steps"
              :next="nextLabel"
              :back="backLabel"
              :finish="finishLabel"
              :hide-back="!back"
              :position="navPos"
              v-bind="bindings.nav()"
            >
              <template #back="slotProps">
                <slot name="back" v-bind="slotProps">
                  <component
                    v-if="outlets?.back"
                    :is="outlets?.back"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
              <template #back-text="slotProps">
                <slot name="back-text" v-bind="slotProps">
                  <component
                    v-if="outlets?.['back-text']"
                    :is="outlets?.['back-text']"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
              <template #next="slotProps">
                <slot name="next" v-bind="slotProps">
                  <component
                    v-if="outlets?.next"
                    :is="outlets?.next"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
              <template #next-text="slotProps">
                <slot name="next-text" v-bind="slotProps">
                  <component
                    v-if="outlets?.['next-text']"
                    :is="outlets?.['next-text']"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
              <template #finish="slotProps">
                <slot name="finish" v-bind="slotProps">
                  <component
                    v-if="outlets?.finish"
                    :is="outlets?.finish"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
              <template #finish-text="slotProps">
                <slot name="finish-text" v-bind="slotProps">
                  <component
                    v-if="outlets?.['finish-text']"
                    :is="outlets?.['finish-text']"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
            </component>
          </slot>

          <button
            v-if="submits"
            :disabled="invalid"
            @click.prevent="handleSubmit"
          >
            Submit
          </button>
        </template>
      </slot>
    </form>
    <component v-if="tokenCss" :is="'style'" :nonce.attr="nonce">
      {{ tokenCss }}
    </component>
  </slot>
</template>
