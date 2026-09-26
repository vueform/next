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
  type FormSchema,
  useConfig,
  useBlueprint,
  defineEvents,
} from '@vueform/ui'
import {
  type VfFormEmits,
  type VfFormProps,
  type VfFormSlots,
  defaults,
  blueprint,
} from '@vueform/ui/components/VfForm'
import '@vueform/ui/form.css'

defineOptions({ name: 'VfForm', inheritAttrs: false })
defineEmits<VfFormEmits<TSchema>>()

const props = withDefaults(defineProps<VfFormProps<TSchema>>(), defaults)
const events = defineEvents<VfFormEmits<TSchema>>()
const slots = defineSlots<VfFormSlots<TSchema>>()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

const config = useConfig()

useClasses(({ props, tokenClass, tokenCss, showErrors, errors }) => ({
  root: {
    'vf-form': true,
    'vf-stacked': props.stacked,
    [tokenClass]: !!tokenCss.value,
    [config.build.darkClass]: props.dark === true,
    [config.build.lightClass]: props.dark === false,
  },
  errorsWrapper: [
    'vf-form-errors-wrapper',
    {
      'sr-only': !showErrors.value || Object.keys(errors.value).length === 0,
    },
  ],
  errors: 'vf-form-errors',
  error: 'vf-form-error',
  messagesWrapper: 'vf-form-messages-wrapper',
  messages: 'vf-form-messages',
  message: 'vf-form-message',
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
  handleLanguageSelect,
  handleSubmit,
} = api

defineExpose(expose)
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <form v-else :class="classes.root" v-bind="parts.root" @submit.prevent>
      <slot name="content" :context>
        <component v-if="outlets?.content" :is="outlets.content" :context />
        <template v-else>
          <template v-if="showErrors">
            <slot name="errors" :errors :id="errorsId">
              <component
                v-if="outlets?.errors"
                :is="outlets.errors"
                :errors
                :id="errorsId"
              />
              <div
                v-else
                :class="classes.errorsWrapper"
                :id="errorsId"
                v-bind="parts.errorsWrapper"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                tabindex="-1"
              >
                <ul :class="classes.errors" v-bind="parts.errors">
                  <template v-for="(fieldErrors, path) in errors" :key="path">
                    <li
                      v-for="error in fieldErrors"
                      :class="classes.error"
                      v-bind="parts.error"
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
            <slot name="messages" :messages :id="messagesId">
              <component
                v-if="outlets?.messages"
                :is="outlets.messages"
                :messages
                :id="messagesId"
              />
              <div
                v-else
                :class="classes.messagesWrapper"
                :id="messagesId"
                v-bind="parts.messagesWrapper"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                tabindex="-1"
              >
                <ul :class="classes.messages" v-bind="parts.messages">
                  <li
                    v-for="message in messages"
                    :class="classes.message"
                    v-bind="parts.message"
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
          >
            <component
              :is="outlets?.languages || 'VfLanguages'"
              :languages
              :language
              :invalid-languages
              :select="selectLanguage"
              v-bind="parts.languages"
              @select="handleLanguageSelect"
            >
              <template #default="slotProps">
                <slot name="language" v-bind="slotProps" />
              </template>
            </component>
          </slot>

          <slot v-if="tabbed" name="tabs" :pager="tabs">
            <component
              :is="outlets?.tabs || 'VfTabs'"
              :pager="tabs"
              v-bind="parts.tabs"
            >
              <template #default="slotProps">
                <slot name="tab" v-bind="slotProps">
                  <component
                    v-if="outlets?.tab"
                    :is="outlets.tab"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
            </component>
          </slot>

          <slot v-if="stepped && progress" name="steps" :pager="steps">
            <component
              :is="outlets?.steps || 'VfSteps'"
              :pager="steps"
              v-bind="parts.steps"
            >
              <template #default="slotProps">
                <slot name="step" v-bind="slotProps">
                  <component
                    v-if="outlets?.step"
                    :is="outlets.step"
                    v-bind="slotProps"
                  />
                </slot>
              </template>
            </component>
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
                    v-bind="el.props"
                    :key="el.props.name"
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
          >
            <component
              :is="outlets?.nav || 'VfNav'"
              :pager="steps"
              :next="nextLabel"
              :back="backLabel"
              :finish="finishLabel"
              :hide-back="!back"
              :position="navPos"
              v-bind="parts.nav"
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
              <template #backText="slotProps">
                <slot name="backText" v-bind="slotProps">
                  <component
                    v-if="outlets?.backText"
                    :is="outlets?.backText"
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
              <template #nextText="slotProps">
                <slot name="nextText" v-bind="slotProps">
                  <component
                    v-if="outlets?.nextText"
                    :is="outlets?.nextText"
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
              <template #finishText="slotProps">
                <slot name="finishText" v-bind="slotProps">
                  <component
                    v-if="outlets?.finishText"
                    :is="outlets?.finishText"
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
