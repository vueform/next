import { computed, toRef, unref } from 'vue'
import type { LooseContext, ReturnsOf, ThemeTokens, TProp } from '#core/types'
import {
  useConfig,
  useDynamicProp,
  useConditions,
  useMessageBag,
  useTokens,
} from '#core/composables'
import { useComponentContext, useFormContext } from '#core/contexts'
import { type makeDisabled, type makeElement } from '#core/features'
import { defineFeature, type FeatureEvents } from '#core/helpers'
import {
  type ConditionalProp,
  type ConditionsTriggerProp,
} from '#core/modules/conditions'
import { resolveRouter } from '#core/utils'

/**
 * Configuration for the button factory providing click handling, loading state,
 * text props, messaging, and theme tokens.
 */
type MakeButtonOptions = {
  props: {
    icon: TProp | undefined
    text: TProp | undefined
    href: TProp | undefined
    to: TProp | undefined
    severity: TProp | undefined
    loading: ConditionalProp | undefined
    conditionsTrigger: ConditionsTriggerProp | undefined
    conditionsDebounce: number | undefined
    action: string | undefined
    tokens: ThemeTokens | undefined
  }

  events: FeatureEvents<{
    click: [event: MouseEvent, context$: LooseContext]
  }>

  deps: ReturnsOf<
    [[typeof makeElement, ['path']], [typeof makeDisabled, ['disabled']]]
  >
}

/**
 * Provides click handling, loading state, text props (icon, text, href, to),
 * static messaging, and scoped theme tokens for a button element.
 *
 * @param options Factory options containing element props, events, and
 *   dependencies.
 */
export const makeButton = defineFeature(
  () =>
    ({ props, events, deps }: MakeButtonOptions) => {
      const context$ = useComponentContext()
      const form$ = useFormContext()
      const config = useConfig()

      const { path, disabled } = deps

      const messageBag = useMessageBag()
      const router = resolveRouter(config.router)

      // =============== THEME ================

      const { tokens, nonce, tokenClass, tokenCss } = useTokens(
        toRef(props, 'tokens')
      )

      /**
       * The reactive list of validation error messages.
       */
      const displayErrors = messageBag.errors

      /**
       * The reactive list of validation error messages.
       */
      const errors = displayErrors

      /**
       * The reactive list of informational messages.
       */
      const messages = messageBag.messages

      // ============== COMPUTED ==============

      /**
       * The resolved icon CSS class string. `$`-prefixed names are mapped
       * through the config-level semantic `icons` map.
       */
      const icon = useDynamicProp('icon', props, {
        icon: true,
      })

      /**
       * The resolved label text for the button.
       */
      const text = useDynamicProp('text', props, {
        localize: true,
      })

      /**
       * The resolved href for the button, supporting dynamic text props.
       */
      const href = useDynamicProp('href', props, {
        localize: true,
        safeUrl: ['http', 'https', 'mailto', 'tel'],
      })

      /**
       * The resolved route location for the button, supporting dynamic text
       * props.
       */
      const to = useDynamicProp('to', props, {
        localize: true,
        safeUrl: ['http', 'https', 'mailto', 'tel'],
      })

      /**
       * The resolved severity of the button, supporting dynamic text props.
       */
      const severity = useDynamicProp('severity', props)

      const conditionalLoading = useConditions(
        toRef(() => props.loading),
        {
          path,
          trigger: toRef(() => props.conditionsTrigger),
          debounce: toRef(() => props.conditionsDebounce),
        }
      )

      /**
       * Whether the button is in a loading state. The `loading` prop is
       * evaluated through the conditions pipeline, so sync and async
       * conditional values are supported uniformly.
       */
      const loading = computed(() => {
        const value = unref(props.loading)

        return value === '' || conditionalLoading.value
      })

      // ============== METHODS ===============

      /**
       * Handles the click event, fires the click event through the event
       * system, and performs the configured action (submit or reset) on the
       * parent form.
       *
       * @param event The native mouse event.
       */
      const handleClick = (event: MouseEvent) => {
        if (disabled.value) return

        if (to.value && router) {
          event.preventDefault()
          router.push(to.value)
        } else if (!to.value && !href.value) {
          event.preventDefault()
        }

        events.fire('click', event, context$)

        if (props.action === 'submit') form$?.submit()
        if (props.action === 'reset') form$?.reset()
      }

      return {
        icon,
        text,
        href,
        to,
        severity,
        loading,
        messageBag,
        displayErrors,
        errors,
        messages,
        tokens,
        tokenClass,
        tokenCss,
        nonce,
        handleClick,
      }
    }
)
