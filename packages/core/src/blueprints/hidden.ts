import { computed } from 'vue'

import { useFeatures } from '#src/composables'
import {
  makeElement,
  makeData,
  makeProvider,
  type ModelPropsWithDefault,
  type BaseElementEmits,
  type BaseElementProps,
  type BaseElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementSlots,
  type ValidationProps,
  type ModelEmits,
  type ValidationEmits,
} from '#src/features'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type { LooseRequired } from '#src/types'

/**
 * Props for the hidden element blueprint.
 */
export interface HiddenProps<
  T extends string = 'hidden',
  S = HiddenSlots,
  P = HiddenParts,
  C = HiddenClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    ModelPropsWithDefault<any, TContext>,
    Omit<ValidationProps<TContext>, 'hideErrors' | 'showRequired'> {
  /**
   * When true the element stores metadata only and renders nothing to the DOM —
   * not even a hidden input.
   */
  meta?: boolean
}

/**
 * Events emitted by the hidden element.
 */
export interface HiddenEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    ValidationEmits<TContext> {}

/**
 * Slots for the hidden element.
 */
export interface HiddenSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Parts for the hidden element.
 */
export interface HiddenParts extends BaseElementParts {}

/**
 * Classes for the hidden element.
 */
export interface HiddenClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for hidden-based components.
 */
export interface HiddenExpose extends BaseElementExpose, HiddenApi {}

/**
 * Factory API produced by the hidden blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type HiddenApi<
  TProps extends HiddenProps<string> = HiddenProps<string>,
> = ReturnType<typeof blueprint<TProps>>

/**
 * Builds the hidden factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends HiddenProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<HiddenEmits>
) {
  const api = useFeatures(props, events)
    .use(makeElement())
    .use(makeData())
    .use(makeProvider())
    .build()

  const { value } = api

  /**
   * The value to bind to the native hidden input's `value` attribute. Resolves
   * to `undefined` when the model is not a string or number so that complex
   * values are not coerced to `[object Object]`.
   */
  const inputValue = computed(() => {
    const v = value.value
    return typeof v === 'string' || typeof v === 'number' ? v : undefined
  })

  return {
    ...api,
    inputValue,
  }
}

/**
 * Default prop values for the hidden blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<HiddenProps>()({
  type: 'hidden',
  submit: true,
  bail: true,
  maxErrors: 1,
  meta: false,
  conditions: undefined,
  expressions: undefined,
})
