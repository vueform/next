import {
  defineDefaults,
  useFeatures,
  makeElement,
  makeLayout,
  makeDisabled,
  makeForwards,
  makeProvider,
  makeButton,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type TProp,
  type AddonableProps,
  type DisabledProps,
  type LoadingProps,
  type LayoutProps,
  type InteractionEmits,
  type BtnEmits,
  type BtnProps,
  useDynamicProp,
  type DProp,
} from '@vueform/core'
import type { ButtonProps as AButtonProps } from 'primevue/button'
import { computed } from 'vue'

import {
  makeInfo,
  makeTooltip,
  type InfoProps,
  type TooltipProps,
} from '#primevue/features'

/**
 * Props for the button element blueprint.
 *
 * Non-generic counterpart — no item-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
export interface ButtonProps<
  T extends string = 'button',
  S = ButtonSlots,
  P = ButtonParts,
  C = ButtonClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    InfoProps,
    TooltipProps,
    Omit<BtnProps<TContext>, 'iconPos'>,
    /* @vue-ignore */ Omit<
      AButtonProps,
      | 'id'
      | 'name'
      | 'type'
      | 'label'
      | 'icon'
      | 'loading'
      | 'disabled'
      | 'text'
      | 'outlined'
      | 'link'
      | 'as'
      | 'asChild'
      | 'plain'
      | 'fluid'
      | 'class'
      | 'style'
      | 'severity'
      | 'badge'
      | 'badgeSeverity'
      | 'onFocus'
      | 'onBlur'
      | 'onClick'
    > {
  /**
   * The color severity of the button.
   */
  severity?: DProp<
    'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast',
    TContext
  >

  /**
   * Value of the badge displayed on the button.
   */
  badge?: TProp<string, TContext>

  /**
   * Severity type of the badge.
   */
  badgeSeverity?: DProp<
    'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast',
    TContext
  >
}

/**
 * Events emitted by the button element.
 */
export interface ButtonEmits<TContext = any>
  extends BaseElementEmits<TContext>, InteractionEmits<TContext>, BtnEmits {}

/**
 * Slots for the button element.
 */
export interface ButtonSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Parts for the button element.
 */
export interface ButtonParts extends BaseElementParts {}

/**
 * Classes for the button element.
 */
export interface ButtonClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for button-based components.
 */
export interface ButtonExpose extends BaseElementExpose, ButtonApi {}

/**
 * Factory API produced by the button blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type ButtonApi<
  TProps extends ButtonProps<string> = ButtonProps<string>,
> = ReturnType<typeof blueprint<TProps>>

/**
 * PrimeVue Button slots to forward from the Vueform adapter to the underlying
 * PrimeVue component.
 */
export const forwards = {
  events: [],
  slots: ['default', 'icon', 'loadingicon'],
} as const

/**
 * Builds the button factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ButtonProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<ButtonEmits>
) {
  const api = useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeDisabled())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(
      makeTooltip({
        event: 'hover',
      })
    )
    .use(makeProvider())
    .use(makeButton())
    .build()

  const as = computed(() => {
    return props.href ? 'a' : undefined
  })

  /**
   * The resolved badge value of the button, supporting dynamic text props.
   */
  const badge = useDynamicProp('badge', props, {
    localize: true,
    string: true,
  })

  /**
   * The resolved badge severity of the button, supporting dynamic text props.
   */
  const badgeSeverity = useDynamicProp('badgeSeverity', props)

  return {
    ...api,
    as,
    badge,
    badgeSeverity,
  }
}

/**
 * Default prop values for the button blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ButtonProps>()({
  type: 'button',
  layout: true,
  conditions: undefined,
  expressions: undefined,
  download: undefined,
  severity: 'secondary',
  tooltipPos: 'bottom',
})
