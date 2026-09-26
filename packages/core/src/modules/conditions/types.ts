import { type MaybeRef, type Ref } from 'vue'
import type {
  MakeConditionalOptions,
  NegatedConditionsProp,
  RawConditionsProp,
} from './createConditions'

/**
 * The full conditions prop type accepted by component props, supporting raw or
 * negated conditions.
 *
 * `TContext` defaults to `any` for schema / blueprint use; component prop
 * interfaces specialize it (same pattern as event `context$`).
 */
export type ConditionalProp<TContext = any> =
  RawConditionsProp<TContext> | NegatedConditionsProp<TContext>

/**
 * Conditions produced by a function (`colConditions`, `itemConditions`, …).
 * Function returns get no contextual typing through `defineSchema`'s generic
 * inference, so structured array literals arrive widened (`string[][]`, not
 * tuple arrays) — the widened shape is accepted and the runtime validates
 * structure, as it already does. Declarative conditions props stay on the
 * strict `ConditionalProp`.
 */
export type ConditionsResult<TContext = any> =
  ConditionalProp<TContext> | readonly (readonly unknown[])[]

/**
 * The accepted forms of the `conditions-trigger` prop, used as the single watch
 * source that drives re-evaluation of a component's async conditional props. An
 * array of element paths watches those elements' values, a `Ref` watches the
 * ref, and a function is used as a Vue watch getter. When omitted, the trigger
 * defaults to any change in the model.
 */
export type ConditionsTriggerProp<TContext = any> =
  string[] | Ref<any> | ((context$: TContext) => any)

/**
 * Global options for the conditions module (the `$conditions` config object).
 */
export interface ConditionsModuleOptions {
  /**
   * Whether to use strict comparisons when evaluating structured conditions.
   * Defaults to `false`.
   */
  strict?: boolean

  /**
   * The debounce delay in milliseconds applied before re-evaluating async
   * conditional props when their trigger source changes. Defaults to `300`.
   */
  debounce?: number
}

/**
 * The conditions module type providing model-bound condition evaluation.
 */
export interface ConditionsModule {
  /**
   * Resolves a single conditional prop into a boolean ref evaluated against the
   * given model.
   *
   * @param conditions The raw conditional value (or a ref/getter to it).
   * @param model The model conditions are checked against.
   * @param context$ The component context passed to function conditions.
   * @param options Path, debounce, trigger, and date format options.
   */
  makeConditional: (
    conditions: MaybeRef<ConditionsResult | undefined>,
    model: MaybeRef<Record<string, any> | undefined>,
    context$: any,
    options?: MakeConditionalOptions
  ) => Ref<boolean>

  /**
   * Resolves conditions for a dynamic list of items into a parallel array of
   * boolean refs, managed inside an effect scope that is rebuilt whenever the
   * source list changes. Items without conditions default to `true`.
   *
   * @param source A ref or getter returning the list of items.
   * @param getConditions Extracts the conditions prop from each item.
   * @param model The model conditions are checked against.
   * @param context$ The component context passed to function conditions.
   * @param options Path, debounce, trigger, and date format options.
   */
  makeConditionalList: <T>(
    source: Ref<T[]>,
    getConditions: (item: T) => ConditionsResult | undefined,
    model: MaybeRef<Record<string, any> | undefined>,
    context$: any,
    options?: MakeConditionalOptions
  ) => Ref<Ref<boolean>[]>
}
