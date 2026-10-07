import type { VNode } from 'vue'

import {
  type StepsApi,
  type StepsClasses,
  type StepsEmits,
  type StepsExpose,
  type StepsParts,
  type StepsProps,
  type StepsSlots,
} from '#src/blueprints/steps'
import type { ResolvedPage } from '#src/composables'
import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  UnknownElement,
  DefineRegistryEntry,
} from '#src/types'

/**
 * Props for the VfSteps component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfStepsProps extends StepsProps<
  VfStepsSlots,
  VfStepsParts,
  VfStepsClasses,
  VfStepsContext
> {}

/**
 * Events emitted by the VfSteps component.
 */
export interface VfStepsEmits extends StepsEmits<VfStepsContext> {}

/**
 * Slots available in the VfSteps component.
 */
export interface VfStepsSlots extends StepsSlots<VfStepsContext> {
  /**
   * Slot that replaces each step wrapper element. Receives step state and page
   * info.
   */
  wrapper: (props: {
    class: ClassValue
    index: number
    label?: string
    meta?: Record<string, any>
    selected: boolean
    invalid: boolean
    loading: boolean
    enabled: boolean
    completed: boolean
    el$: UnknownElement
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces each step's inner content. Receives step state.
   */
  default: (props: {
    index: number
    label?: string
    meta?: Record<string, any>
    selected: boolean
    invalid: boolean
    loading: boolean
    enabled: boolean
    completed: boolean
    el$: UnknownElement
  }) => VNode[]
}

/**
 * Structural parts of the VfSteps component.
 */
export interface VfStepsParts extends StepsParts {
  /**
   * The root steps container element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * The ordered list element containing all steps.
   *
   * @tag ol
   */
  list: DomAttrsOf<'ol'>

  /**
   * Each step wrapper. Receives step state options.
   *
   * @param options Step state used for this wrapper.
   * @tag li
   */
  wrapper: (options: {
    selected: boolean
    enabled: boolean
    completed: boolean
    invalid: boolean
    loading: boolean
  }) => DomAttrsOf<'li'>

  /**
   * The step content element.
   *
   * @tag li
   */
  step: DomAttrsOf<'li'>
}

/**
 * CSS classes for the VfSteps component's structural parts.
 */
export interface VfStepsClasses extends StepsClasses {
  /**
   * The root steps container element.
   */
  root: ClassValue

  /**
   * The ordered list element containing all steps.
   */
  list: ClassValue

  /**
   * Each step wrapper. Receives step state options.
   *
   * @param options Step state used for this wrapper.
   */
  wrapper: (options: {
    selected: boolean
    enabled: boolean
    completed: boolean
    invalid: boolean
    loading: boolean
  }) => ClassValue

  /**
   * The step content element.
   */
  step: ClassValue
}

/**
 * Augmentable public API surface for VfSteps.
 */
export interface VfStepsExpose extends StepsExpose {}

/**
 * Public context for VfSteps.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfStepsContext extends DefineElementContext<
  VfStepsProps,
  VfStepsEmits,
  VfStepsSlots,
  VfStepsParts,
  VfStepsClasses,
  VfStepsExpose,
  StepsApi
> {}

/**
 * Registry entry for VfSteps. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfSteps has no prop-driven generics.
 */
export interface VfStepsEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfStepsProps,
  VfStepsEmits,
  VfStepsSlots,
  VfStepsParts,
  VfStepsClasses,
  VfStepsContext
> {}
