import type { VNode } from 'vue'

import {
  type StepsApi,
  type StepsBindings,
  type StepsClasses,
  type StepsEmits,
  type StepsExpose,
  type StepsParts,
  type StepsProps,
  type StepsSlots,
} from '#src/blueprints/steps'
import type { PartBindings, ResolvedPage } from '#src/composables'
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

    /**
     * The step button's resolved bindings (part overrides, state attributes);
     * apply with `v-bind`.
     */
    bindings: PartBindings<'step', VfStepsParts, VfStepsBindings>
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
   * Each step wrapper. Receives the step's resolved page.
   *
   * @param page The resolved page data for this step.
   * @tag li
   */
  wrapper: (page: ResolvedPage) => DomAttrsOf<'li'>

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
   * Each step wrapper. State is exposed via `data-selected`, `data-enabled`,
   * `data-completed`, `data-invalid`, and `data-loading` attributes.
   */
  wrapper: ClassValue

  /**
   * The step content element.
   */
  step: ClassValue
}

/**
 * Part-keyed binding definitions of the VfSteps component, registered via
 * `useBindings`. The `wrapper` entry is a parameterized resolver, so the key
 * is functional — the template calls `bindings.wrapper(page)`.
 */
export interface VfStepsBindings extends StepsBindings {
  /**
   * Each step wrapper's selection, navigation, completion, validity, and
   * loading state.
   *
   * @param page The resolved page object for this step.
   */
  wrapper: (page: ResolvedPage) => {
    'data-selected'?: ''
    'data-enabled'?: ''
    'data-completed'?: ''
    'data-invalid'?: ''
    'data-loading'?: ''
  }
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
  VfStepsBindings,
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
