import type { VNode } from 'vue'

import type {
  BlueprintContext,
  DefaultContextA11y,
  DefaultContextModifiers,
} from '#src/composables'
import type { DefineEvents } from '#src/helpers'

import type { ClassValue } from './classes'
import type {
  ClassesProp,
  ComponentProp,
  PartsProp,
  PresetsProp,
  ReclassProp,
  SlotsProp,
} from './props'
import type { LooseContext } from './shared'

/**
 * Base public context for plain form components (e.g. addon, nav). Wraps
 * `BlueprintContext` — blueprint `*Context` interfaces should extend this (or
 * `BaseElementContext`) rather than `BlueprintContext` directly.
 *
 * `TEvents` is always the raw emit map (e.g. `SelectEmits`) and is wrapped with
 * `DefineEvents` eagerly. `DefineEvents` has statically known keys, so
 * blueprint `*Context` interfaces can extend this even while `TProps` /
 * `TEvents` are still type parameters (the conditional `EventsOf` alone would
 * defer and break interface heritage).
 *
 * Kept as a type alias (not an interface) so it can wrap the mapped
 * `BlueprintContext` shape when `TApi` is still a type parameter.
 *
 * `TApi` is typically `typeof setup`.
 */
export type BaseComponentContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TModifiers = DefaultContextModifiers<TApi, TSlots>,
  TA11y = DefaultContextA11y<TApi, TSlots>,
> = BlueprintContext<
  TApi,
  TProps,
  DefineEvents<TEvents>,
  TSlots,
  TParts,
  TClasses,
  TModifiers,
  TA11y
>

/**
 * Base props shared by all Vueform components (elements, form, and layout
 * components).
 */
export interface BaseComponentProps<S, P, C, TContext = any> {
  /**
   * CSS classes to apply to the component's root element.
   */
  class?: ClassValue

  /**
   * Named configuration presets to apply to the component.
   */
  presets?: PresetsProp

  /**
   * Custom DOM attribute overrides for the component's structural parts.
   */
  parts?: PartsProp<P, TContext>

  /**
   * Custom CSS class overrides for the component's structural parts.
   */
  classes?: ClassesProp<C, TContext>

  /**
   * CSS class overrides that replace (rather than merge with) default classes.
   */
  reclass?: ReclassProp<C, TContext>

  /**
   * Custom Vue components to use for named slots. Every component resolves it
   * through the standard outlets pipeline (see `useOutlets`).
   */
  slots?: SlotsProp<S>

  /**
   * A custom Vue component to use as the template instead of the default.
   */
  template?: ComponentProp | null

  /**
   * A custom Vue component to render in the component's default slot.
   */
  component?: ComponentProp
}

/**
 * Base lifecycle events emitted by all Vueform components.
 */
export interface BaseComponentEmits<TContext = LooseContext> {
  /**
   * Emitted before the component is mounted.
   *
   * @param context$ The component's context instance.
   */
  beforeMount: [context$: TContext]

  /**
   * Emitted after the component is mounted.
   *
   * @param context$ The component's context instance.
   */
  mounted: [context$: TContext]

  /**
   * Emitted before the component is unmounted.
   *
   * @param context$ The component's context instance.
   */
  beforeUnmount: [context$: TContext]

  /**
   * Emitted after the component is unmounted.
   *
   * @param context$ The component's context instance.
   */
  unmounted: [context$: TContext]

  /**
   * Emitted after the component is updated.
   *
   * @param context$ The component's context instance.
   */
  updated: [context$: TContext]
}

/**
 * Base slots shared by all Vueform components.
 *
 * `TContext` defaults to `LooseContext` and is overridden by element /
 * component slot maps that pass a concrete context (see `VfSelectSlots`).
 */
export interface BaseComponentSlots<TContext = LooseContext> {
  /**
   * Slot that replaces the entire component rendering. Receives the full
   * component context as a single `context` prop.
   *
   * @param scope The template slot's params.
   */
  template: (scope: {
    /**
     * The component context.
     */
    context: TContext
  }) => VNode[]
}

export interface BaseComponentParts {}
export interface BaseComponentClasses {}
export interface BaseComponentModifiers {}
export interface BaseComponentA11y {}
export interface BaseComponentExpose {}

/**
 * Base public context for form elements (e.g. select, text). Extends
 * `BaseComponentContext` (same shape today; reserved for element-only fields).
 *
 * `TApi` is typically `typeof setup`.
 */
export type BaseElementContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TModifiers = DefaultContextModifiers<TApi, TSlots>,
  TA11y = DefaultContextA11y<TApi, TSlots>,
> = BaseComponentContext<
  TApi,
  TProps,
  TEvents,
  TSlots,
  TParts,
  TClasses,
  TModifiers,
  TA11y
>
