import { computed, toRef, useId } from 'vue'
import { useDynamicProp, type Pager, useLocale } from '~/composables'
import { useFormContext } from '~/contexts'
import { defineDefaults, type DefineEvents } from '~/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentExpose,
  BaseComponentClasses,
  LooseRequired,
  TProp,
} from '~/types'

/**
 * Positioning options for the nav component.
 */
export type NavPosProp = 'left' | 'center' | 'right' | 'fluid' | 'auto'

/**
 * Props for the nav component blueprint that renders back/next/finish
 * navigation buttons.
 */
export interface NavProps<
  S = NavSlots,
  P = NavParts,
  C = NavClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The pager instance managing step/tab navigation state.
   */
  pager: Pager

  /**
   * The label text for the "back" navigation button.
   */
  back?: TProp<string, TContext>

  /**
   * The label text for the "next" navigation button.
   */
  next?: TProp<string, TContext>

  /**
   * The label text for the "finish" navigation button.
   */
  finish?: TProp<string, TContext>

  /**
   * Whether to hide the "back" navigation button.
   */
  hideBack?: boolean

  /**
   * @write
   */
  position?: NavPosProp
}

/**
 * Events emitted by the nav component.
 */
export interface NavEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the nav component.
 */
export interface NavSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the nav component.
 */
export interface NavParts extends BaseComponentParts {}

/**
 * CSS classes of the nav component.
 */
export interface NavClasses extends BaseComponentClasses {}

/**
 * Augmentable public API surface for nav-based components.
 */
export interface NavExpose extends BaseComponentExpose, NavApi {}

/**
 * Factory API produced by the nav blueprint's `blueprint` function, optionally
 * parameterized by concrete props. Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites.
 */
export type NavApi<TProps extends NavProps = NavProps> = ReturnType<
  typeof blueprint<TProps>
>

/**
 * ARIA attribute bindings for the back navigation control.
 */
export interface NavBackAriaBindings {
  'aria-disabled': boolean
}

/**
 * ARIA attribute bindings for the next/finish navigation controls.
 */
export interface NavForwardAriaBindings {
  'aria-busy': boolean
  'aria-disabled': boolean
  'aria-describedby': string | undefined
}

/**
 * Builds the nav factory API from resolved props and events. Resolves
 * back/next/finish button labels and loading state from the pager.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 *
 * @param props Resolved component props.
 * @param _events Event emitter created by `defineEvents`.
 */
export function blueprint<TProps extends NavProps>(
  props: LooseRequired<TProps>,
  _events: DefineEvents<NavEmits>
) {
  const form$ = useFormContext()

  if (!form$) {
    throw new Error('<VfNav> must be used inside a <VfForm> component')
  }

  const { t } = useLocale()

  const uid = useId()

  /**
   * The resolved label text for the "back" button.
   */
  const backLabel = useDynamicProp(
    'step-back',
    toRef(() => props.back || t('steps_back')),
    {
      context$: form$,
      localize: true,
    }
  )

  /**
   * The resolved label text for the "next" button.
   */
  const nextLabel = useDynamicProp(
    'step-next',
    toRef(() => props.next || t('steps_next')),
    {
      context$: form$,
      localize: true,
    }
  )

  /**
   * The resolved label text for the "finish" button.
   */
  const finishLabel = useDynamicProp(
    'step-finish',
    toRef(() => props.finish || t('steps_finish')),
    {
      context$: form$,
      localize: true,
    }
  )

  /**
   * Whether the current page is in a loading state.
   */
  const loading = computed(() => !!props.pager.currentPage?.loading)

  /**
   * @write
   */
  const fluid = computed(() => props.position === 'fluid')

  /**
   * The HTML `id` for the navigation status message element.
   */
  const statusId = computed(() => `${uid}__status`)

  /**
   * The `aria-describedby` value linking to the status element when on the last
   * enabled page with errors or loading.
   */
  const describedby = computed(() =>
    props.pager.currentPage?.index === props.pager.lastEnabled &&
    (props.pager.invalid || props.pager.loading)
      ? statusId.value
      : undefined
  )

  /**
   * Ready-to-spread ARIA attribute bindings for the back control — applied to
   * the built-in button and passed to the `back` slot as `a11yBindings`.
   */
  const backAriaBindings = computed<NavBackAriaBindings>(() => ({
    'aria-disabled': !props.pager.previousPage,
  }))

  /**
   * Ready-to-spread ARIA attribute bindings for the next/finish controls —
   * applied to the built-in buttons and passed to the `next` / `finish` slots
   * as `a11yBindings`.
   */
  const forwardAriaBindings = computed<NavForwardAriaBindings>(() => ({
    'aria-busy': loading.value,
    'aria-disabled': loading.value,
    'aria-describedby': describedby.value,
  }))

  return {
    backLabel,
    loading,
    fluid,
    describedby,
    backAriaBindings,
    forwardAriaBindings,
    nextLabel,
    finishLabel,
    statusId,
  }
}

/**
 * Default prop values for the nav blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<NavProps>()({
  hideBack: true,
  position: 'auto',
})
