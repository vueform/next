import { useFeatures } from '~/composables'
import {
  makeButton,
  makeDisabled,
  makeLayout,
  makeElement,
  type DisabledProps,
  type BaseElementEmits,
  type BaseElementProps,
  type BaseElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementSlots,
  type AddonableProps,
  type LoadingProps,
  type LayoutProps,
  type InteractionEmits,
  type BtnEmits,
  type BtnProps,
} from '~/features'
import { defineDefaults, type DefineEvents } from '~/helpers'
import type { DProp, LooseRequired } from '~/types'

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
    BtnProps {
  /**
   * The visual variant of the button.
   */
  variant?: 'filled' | 'outlined' | 'text' | 'link'

  /**
   * The color severity of the button.
   */
  severity?: DProp<
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast',
    TContext
  >

  /**
   * The size of the button.
   */
  size?: 'medium' | 'small'
}

/**
 * Events emitted by the button element.
 */
export interface ButtonEmits<TContext = any>
  extends BaseElementEmits<TContext>, BtnEmits, InteractionEmits<TContext> {}

/**
 * Slots available on the button element blueprint.
 */
export interface ButtonSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the button element blueprint.
 */
export interface ButtonParts extends BaseElementParts {}

/**
 * CSS classes for the button element blueprint.
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
 * Builds the button factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ButtonProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<ButtonEmits>
) {
  return useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeDisabled())
    .use(makeButton())
    .build()
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
  iconPos: 'left',
  severity: 'secondary',
  variant: 'filled',
  size: 'medium',
  disabled: false,
  loading: false,
})
