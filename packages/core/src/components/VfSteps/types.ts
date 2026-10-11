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
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
  wrapper: (scope: {
    /**
     * CSS classes for the step wrapper.
     */
    class: ClassValue

    /**
     * The zero-based index of the step's page.
     */
    index: number

    /**
     * The step's resolved label text.
     */
    label?: string

    /**
     * The metadata object from the page prop's tuple form.
     */
    meta?: Record<string, any>

    /**
     * Whether the step is currently selected.
     */
    selected: boolean

    /**
     * Whether the step's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the step's page is busy validating or processing an event.
     */
    loading: boolean

    /**
     * Whether the step is enabled for navigation.
     */
    enabled: boolean

    /**
     * Whether the step's page has been completed.
     */
    completed: boolean

    /**
     * The step's element context.
     */
    el$: UnknownElement

    /**
     * The resolved page object for this step.
     */
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces each step's inner content. Receives step state.
   */
  default: (scope: {
    /**
     * The zero-based index of the step's page.
     */
    index: number

    /**
     * The step's resolved label text.
     */
    label?: string

    /**
     * The metadata object from the page prop's tuple form.
     */
    meta?: Record<string, any>

    /**
     * Whether the step is currently selected.
     */
    selected: boolean

    /**
     * Whether the step's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the step's page is busy validating or processing an event.
     */
    loading: boolean

    /**
     * Whether the step is enabled for navigation.
     */
    enabled: boolean

    /**
     * Whether the step's page has been completed.
     */
    completed: boolean

    /**
     * The step's element context.
     */
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
    /**
     * Whether the step is currently selected.
     */
    selected: boolean

    /**
     * Whether the step is enabled for navigation.
     */
    enabled: boolean

    /**
     * Whether the step's page has been completed.
     */
    completed: boolean

    /**
     * Whether the step's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the step's page is busy validating or processing an event.
     */
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
