import { computed, toRef, useId } from 'vue'

import { useDynamicProp, type Pager, useLocale } from '#src/composables'
import { useFormContext } from '#src/contexts'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentExpose,
  BaseComponentClasses,
  BaseComponentA11y,
  BaseComponentModifiers,
  LooseRequired,
  TProp,
} from '#src/types'

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
   * The alignment of the navigation buttons: `'left'`, `'center'`, `'right'`,
   * `'fluid'` (stretched to full width), or `'auto'`.
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
 * Styling modifiers of the nav component.
 */
export interface NavModifiers extends BaseComponentModifiers {}

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
 * Accessibility bindings of the nav component.
 */
export interface NavA11y extends BaseComponentA11y {
  /**
   * ARIA state for the back navigation control.
   */
  back: {
    'aria-disabled'?: true
  }

  /**
   * ARIA state for the next navigation control.
   */
  next: {
    'aria-busy'?: true
    'aria-disabled'?: true
    'aria-describedby'?: string
  }

  /**
   * ARIA state for the finish navigation control.
   */
  finish: {
    'aria-busy'?: true
    'aria-disabled'?: true
    'aria-describedby'?: string
  }

  /**
   * The screen-reader status region's id and role.
   */
  status: {
    id: string
    role: 'status'
  }
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
   * Whether the navigation buttons are stretched to the full available width
   * (`position: 'fluid'`).
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
   * Part-keyed accessibility bindings: ready-to-spread attribute bags for the
   * back, next, and finish controls (also passed to their slots) and for the
   * screen-reader status region.
   */
  const a11yBindings = computed<NavA11y>(() => {
    const forward = {
      'aria-busy': loading.value || undefined,
      'aria-disabled': loading.value || undefined,
      'aria-describedby': describedby.value,
    }

    return {
      back: {
        'aria-disabled': !props.pager.previousPage || undefined,
      },
      next: forward,
      finish: forward,
      status: {
        id: statusId.value,
        role: 'status',
      },
    }
  })

  return {
    backLabel,
    loading,
    fluid,
    describedby,
    a11yBindings,
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
