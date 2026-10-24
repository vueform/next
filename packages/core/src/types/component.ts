/* eslint-disable no-unused-vars -- TEntry is required for module augmentation */

import type { Component, ComponentPropsOptions } from 'vue'

import type { BaseElementContext } from './base'
import type { ClassValue } from './classes'
import type { NarrowExpose } from './utils'

/**
 * A slot callback with its signature re-declared in method syntax, which is
 * bivariant under `strictFunctionTypes` — narrow-context SFC slots stay
 * assignable to the canonical wide-context ones. Non-function members pass
 * through unchanged.
 */
type BivariantSlot<F> = F extends (...args: infer A) => infer R
  ? { fn(...args: A): R }['fn']
  : F

/**
 * The shape of a single component registration in the `*Registry` interfaces.
 *
 * `TContext` is the full public context — exactly what `defineExpose` receives
 * from `useBlueprint` (factory API + event helpers + `props` / `parts` /
 * `classes` / `outlets`). `TProps` / `TEmits` are instantiated from the
 * registry's `TEntry` payload for prop-generic components; `TSlots` / `TParts`
 * / `TClasses` stay wide (narrowed slots already flow through `TProps`).
 */
export type DefineRegistryEntry<
  TProps extends Record<string, any>,
  TEmits extends Record<string, any>,
  TSlots extends Record<string, any>,
  TParts extends Record<string, any>,
  TClasses extends Record<string, any> &
    PartKeyed<TClasses, TParts> &
    ClassShaped<TClasses>,
  TContext,
> = {
  /**
   * The component's prop types, narrowed by the registry `TEntry` payload for
   * prop-generic components.
   */
  props: TProps

  /**
   * The component's emit map, narrowed by the registry `TEntry` payload so
   * schema `on*` handlers receive the narrowed context.
   */
  emits: TEmits

  /**
   * The component's slot definitions (wide).
   */
  slots: TSlots

  /**
   * The component's template part definitions (wide).
   */
  parts: TParts

  /**
   * The component's CSS class definitions (wide).
   */
  classes: TClasses

  /**
   * The component's full public context — the `defineExpose` shape, narrowed by
   * the registry `TEntry` payload for prop-generic components.
   */
  context: TContext
}

/**
 * Stores control type component definitions (plain elements, e.g. text, select,
 * button).
 *
 * `TEntry` is the concrete props payload of one usage (a schema entry or an
 * explicit instantiation); registrations map it onto their generic types.
 * Augmentations must repeat the bare `<TEntry>` type parameter:
 *
 * ```ts
 * declare module '@vueform/core' {
 *   interface ControlRegistry<TEntry> {
 *     VfSelect: VfSelectEntry<TEntry>
 *   }
 * }
 * ```
 */
export interface ControlRegistry<TEntry = Record<string, any>> {}

/**
 * Stores group type component definitions (group-like containers).
 */
export interface GroupRegistry<TEntry = Record<string, any>> {}

/**
 * Stores list type component definitions (list-like containers).
 */
export interface ListRegistry<TEntry = Record<string, any>> {}

/**
 * Stores grid type component definitions (grid-like containers).
 */
export interface GridRegistry<TEntry = Record<string, any>> {}

/**
 * Stores matrix type component definitions (matrix-like containers).
 */
export interface MatrixRegistry<TEntry = Record<string, any>> {}

/**
 * Stores all element definitions (no direct registration — combined from the
 * family registries).
 */
export interface ElementRegistry<TEntry = Record<string, any>>
  extends
    ControlRegistry<TEntry>,
    GroupRegistry<TEntry>,
    ListRegistry<TEntry>,
    GridRegistry<TEntry>,
    MatrixRegistry<TEntry> {}

/**
 * Stores all component definitions. Components that are not elements (e.g.
 * `VfForm`, `VfNav`) register directly to this.
 */
export interface ComponentRegistry<
  TEntry = Record<string, any>,
> extends ElementRegistry<TEntry> {}

/**
 * Union of all registered element names.
 */
export type ElementNames = keyof ElementRegistry

/**
 * Union of all registered component names.
 */
export type ComponentNames = keyof ComponentRegistry

/**
 * Catch-all element context when the concrete element type is unknown (e.g.
 * unknown `find()` paths).
 *
 * Intentionally not `ContextOf<ElementNames>`: that union instantiates every
 * registered element's context graph and dominates typecheck time. Call sites
 * that know the element should use `ContextOf<'Vf…'>` instead.
 */
export type UnknownElement = any

/**
 * @write
 */
export type UnknownComponent = any

// ================= CONTEXTS =================

export type FormContext = ContextOf<'VfForm'>

/**
 * Returns the full public context of a registered component — the
 * `defineExpose` shape from `useBlueprint`, plus `$config`, `$i18n`, and
 * `$globals` injected by `createComponentContext` on every component.
 *
 * Pass a props payload as `TEntry` to narrow prop-generic components the same
 * way SFC generics do:
 *
 * ```ts
 * ContextOf<'VfSelect', { items: typeof items; itemValue: 'id' }>
 * ```
 */
export type ContextOf<
  T extends ComponentNames,
  TEntry = Record<string, any>,
> = ComponentRegistry<TEntry>[T]['context']

/**
 * Returns the context of a component without unwrapped refs. Currently an alias
 * of `ContextOf` (contexts are stored ref-unwrapped in the registry).
 */
export type RawContextOf<
  T extends ComponentNames,
  TEntry = Record<string, any>,
> = ContextOf<T, TEntry>

/**
 * Extracts the props type for a given component from its registry entry,
 * optionally narrowed by a `TEntry` payload.
 */
export type PropsOf<
  T extends ComponentNames,
  TEntry = Record<string, any>,
> = ComponentRegistry<TEntry>[T]['props']

/**
 * Extracts the emit map for a given component from its registry entry,
 * optionally narrowed by a `TEntry` payload.
 */
export type EmitsOf<
  T extends ComponentNames,
  TEntry = Record<string, any>,
> = ComponentRegistry<TEntry>[T]['emits']

/**
 * Extracts a partial props type for a given component, used for individual part
 * prop overrides. The component may not be registered in the current program —
 * registration is augmentation-driven (a component's `unstyled.ts`), so this
 * must not assume the key exists (e.g. an adapter's src-based type program
 * loads only its own components: no `VfIcon` / `VfTabs` in PrimeVue). Falls
 * back to a loose props record when the key is absent.
 */
export type PartOf<T extends ComponentNames | (string & {})> =
  T extends ComponentNames ? Partial<PropsOf<T>> : Record<string, any>

/**
 * The `outlets` shape of a public context: every declared slot name, optional
 * (an outlet only exists when an inline slot or `slots`-prop entry fills it),
 * with its payload types kept but made bivariant (see `BivariantSlot`).
 */
export type ContextOutlets<TSlots> = {
  // Context-carrying slots (`template`, form `content`, field `default`, …)
  // keep their signature but with the `context` payload member widened to
  // `unknown`: it embeds the host context itself, which the SFC instantiates
  // with its own generic props — incompatible with the canonical
  // instantiation in both directions, so bivariance can't bridge that one
  // member. `unknown` accepts any concrete context in the covariant
  // direction (which is all bivariance needs) without leaking `any` to
  // consumers; the consumer already holds a typed `context` anyway.
  //
  // Detected by a `context` key on the inferred payload — not by
  // assignability to `(props: { context: any }) => …`, which zero-arg slots
  // (`() => VNode[]`) and empty-payload slots (`(props: {}) => VNode[]`)
  // would also match (fewer/looser params accept more). For a zero-arg slot
  // the payload infers as `unknown`, whose `keyof` is `never`, so it stays
  // fully typed.
  [K in keyof TSlots]?: TSlots[K] extends (props: infer P) => infer R
    ? 'context' extends keyof P
      ? BivariantSlot<
          (props: {
            [K2 in keyof P]: K2 extends 'context' ? unknown : P[K2]
          }) => R
        >
      : BivariantSlot<TSlots[K]>
    : BivariantSlot<TSlots[K]>
}

// ============ BINDING SURFACE CONTRACTS ============

/**
 * The element-layout part names core renders through VfLayout. Adapters own
 * the part SHAPES (their `BaseElementParts` augmentations differ per adapter),
 * but core owns the KEY vocabulary — these keys stand in for those parts in
 * core-world checks, where the adapter augmentations are not loaded. An
 * augmentable interface (member values are irrelevant) so adapters can
 * declaration-merge keys of their own that are legitimately partless (e.g. a
 * class styling a directive-rendered overlay).
 */
export interface LayoutPartKeyRegistry {
  root: unknown
  panel: unknown
  labelGroup: unknown
  label: unknown
  required: unknown
  help: unknown
  elementGroup: unknown
  elementWrapper: unknown
  addonGroup: unknown
  iconGroup: unknown
  addonBefore: unknown
  addonAfter: unknown
  iconBefore: unknown
  iconAfter: unknown
  language: unknown
  loading: unknown
  tabs: unknown
  description: unknown
  errors: unknown
  error: unknown
  messages: unknown
  message: unknown
}

/**
 * The key union of `LayoutPartKeyRegistry` — see there.
 */
export type LayoutPartKeys = keyof LayoutPartKeyRegistry

/**
 * Resolves a functional aspect member to the bag it returns; plain members
 * pass through.
 */
type ResolvedSurfaceMember<T> =
  NonNullable<T> extends (...args: any[]) => infer R ? R : NonNullable<T>

/**
 * Part-key subset check: every key of an aspect surface (classes, modifiers,
 * a11y) must be backed by a part — a key of `TParts` or a layout part core
 * renders. Violations surface as an impossible constraint carrying the
 * offending keys in `__keysWithoutPart`. Loose surfaces (string index
 * signatures) are exempt.
 */
export type PartKeyed<T, TParts> = string extends keyof T
  ? unknown
  : [Exclude<keyof T, keyof TParts | LayoutPartKeys>] extends [never]
    ? unknown
    : { __keysWithoutPart: Exclude<keyof T, keyof TParts | LayoutPartKeys> }

/**
 * Classes member shape check: every member must be a `ClassValue` or a
 * function returning one.
 */
export type ClassShaped<T> = string extends keyof T
  ? unknown
  : {
      [K in keyof T]: ClassValue | ((...args: any[]) => ClassValue)
    }

/**
 * Collects the shared keys where both the part and the aspect member are
 * functional but their parameter tuples differ — the aggregate resolves every
 * aspect with ONE argument list, so functional signatures must match per part.
 * (A static member under a functional part, or a functional classes member
 * under a static part, is allowed: the aggregate resolves plain bags as-is.)
 */
type AsymmetricKeys<T, TParts> = {
  [K in keyof T & keyof TParts]: NonNullable<TParts[K]> extends (
    ...args: infer A
  ) => any
    ? NonNullable<T[K]> extends (...args: infer B) => any
      ? [A, B] extends [B, A]
        ? never
        : K
      : never
    : never
}[keyof T & keyof TParts]

/**
 * Functional-signature symmetry check between an aspect surface and the parts
 * spine — see `AsymmetricKeys`.
 */
export type PartSymmetric<T, TParts> = string extends keyof T
  ? unknown
  : [AsymmetricKeys<T, TParts>] extends [never]
    ? unknown
    : { __membersNotMatchingPartSignature: AsymmetricKeys<T, TParts> }

/**
 * Assembles a component's `*Context` from its public type surfaces:
 *
 * ```ts
 * interface VfSelectContext<
 *   TProps extends VfSelectProps = VfSelectProps,
 * > extends DefineElementContext<
 *   TProps,
 *   VfSelectEmits,
 *   VfSelectSlots,
 *   VfSelectParts,
 *   VfSelectClasses,
 *   VfSelectBindings,
 *   VfSelectExpose,
 *   SelectApi<TProps>
 * > {}
 * ```
 *
 * Bundles the two constructions every context needs:
 *
 * - `NarrowExpose<TExpose, TApi>` — replaces the Expose's wide API members with
 *   the prop-instantiated ones (`TApi` may be an intersection when a component
 *   extension adds members).
 * - `ContextOutlets<TSlots>` for `outlets` — the slot map with every callback
 *   made bivariant. Using the slots interface as-is breaks SFC context
 *   assignability: slot callbacks are contravariant in their context parameter,
 *   so the SFC's narrow slots would not be assignable to the canonical ones.
 *   Method-syntax signatures are exempt from strict contravariance, which keeps
 *   the payload types on `context.outlets.*` without breaking that assignment.
 *
 * The consuming `*Context` must remain an interface (it sits on the recursive
 * props → context → api → props loop); only its body is factored out here.
 *
 * Convention for prop-generic components: type-parameter defaults on the
 * component's `*Props` / `*Emits` / `*Slots` interfaces must be wide (`any`, or
 * helpers that resolve to `any` like select's `ItemValueOf`) — runtime defaults
 * belong in blueprint `defaults` and the SFC's `generic="… = …"` default, and
 * per-usage narrowing in the registry entry's `EntryPropOr` fallbacks. A
 * concrete literal default (e.g. `= true`) makes the bare interface used here
 * concrete, and the SFC's generic-narrowed `defineSlots` then fails to assign
 * to this context's outlets (TS can't relate an open type parameter to a
 * literal in either direction).
 */
export type DefineElementContext<
  TProps extends Record<string, any>,
  TEmits extends Record<string, any>,
  TSlots extends Record<string, any>,
  TParts extends Record<string, any>,
  TClasses extends Record<string, any> &
    PartKeyed<TClasses, TParts> &
    ClassShaped<TClasses> &
    PartSymmetric<TClasses, TParts>,
  TBindings extends PartKeyed<TBindings, TParts>,
  TExpose,
  TApi extends Record<string, any>,
> = BaseElementContext<
  NarrowExpose<TExpose, TApi>,
  TProps,
  TEmits,
  ContextOutlets<TSlots>,
  TParts,
  TClasses,
  TBindings
>

// ================== HELPERS =================

/**
 * Describes the shape of an element that carries form state, used internally
 * for validation and data handling.
 */
export interface StatefulElement {
  /**
   * The element's field name.
   */
  name: string | number

  /**
   * The element's dot-separated path in the form data tree.
   */
  path: string

  /**
   * The element's dot-separated path used for data submission.
   */
  dataPath: string

  /**
   * A human-readable display name for the element, used in validation messages.
   */
  genericName: string

  /**
   * The element's current value.
   */
  value: any

  /**
   * The element's bound model value.
   */
  model: any

  /**
   * The element's submission payload keyed by field name.
   */
  payload: Record<string, any>

  /**
   * Whether the element is a static (non-data) element.
   */
  isStatic: boolean

  /**
   * Whether the element is currently visible and active based on conditions.
   */
  available: boolean

  /**
   * Whether the element has been interacted with by the user.
   */
  touched: boolean

  /**
   * Whether the element has been validated at least once.
   */
  validated: boolean

  /**
   * Whether the element currently has validation errors.
   */
  invalid: boolean

  /**
   * Whether the element has pending async validations.
   */
  pending: boolean

  /**
   * Whether the element's input is currently being debounced.
   */
  debouncing: boolean

  /**
   * Whether the element's value is considered empty.
   */
  empty: boolean

  /**
   * Whether the element is completed, meaning it either has no rules or has
   * been validated without errors.
   */
  completed: boolean

  /**
   * Whether the element's children should be flattened in the data output.
   */
  flat?: boolean

  /**
   * Whether the element is a container whose data is flattened into its
   * parent's level rather than nested under its own key (e.g. a group with
   * `nested: false`).
   */
  isFlatContainer?: boolean

  /**
   * Whether this element pushes its errors to its nearest ancestor element.
   * When enabled, the element does not display or report its own errors; the
   * ancestor includes them in its own errors, display errors, and form errors
   * instead.
   */
  hoist?: boolean

  /**
   * Resolved value of the `hoist` prop indicating whether this element's errors
   * are pushed to its nearest ancestor element.
   */
  hoisted?: boolean

  /**
   * The element's own errors including all languages (messageBag + validation).
   */
  ownErrors: string[]

  /**
   * The list of current visible error messages for the element, scoped to the
   * active language and limited by `maxErrors`.
   */
  errors: string[]

  /**
   * Error messages propagated to the form, keyed by element path.
   */
  formErrors: Record<string, string[]>

  /**
   * Custom validation messages keyed by rule name.
   */
  ruleMessages?: Record<string, any>

  /**
   * The element's resolved props, including optional debounce, bail, and
   * valueFormat settings.
   */
  props?: Record<string, any> & {
    /**
     * Debounce delay in milliseconds for input validation.
     */
    debounce?: number

    /**
     * Whether to stop validation after the first failing rule.
     */
    bail?: boolean

    /**
     * The format string used for value serialization (e.g. date format).
     */
    valueFormat?: string
  }

  /**
   * The value format string, used when the element serializes values (e.g.
   * dates).
   */
  valueFormat?: string

  /**
   * Loads a value programmatically and untracks expression tracking on this
   * element and all children that have `untrackOn` including `'load'`.
   *
   * @param data The value to load.
   */
  load?: (data: any) => void

  /**
   * Determines whether the given value should be considered non-empty.
   *
   * @param value The value to check.
   */
  filled: (value: any) => boolean

  /**
   * Updates the element's value programmatically.
   *
   * @param data The new value to set.
   */
  update: (data: any) => void

  /**
   * Resets the element to its default value and clears validation state.
   */
  reset: () => void

  /**
   * Clears the element's value to an empty state.
   */
  clear: () => void

  /**
   * Runs validation rules on the element and returns the result.
   */
  validate: () => Promise<any>

  /**
   * Removes all validation state from the element.
   */
  unvalidate: () => void

  /**
   * Marks the element as untouched and pristine.
   */
  clean: () => void

  /**
   * Verifies the element's value against async server-side checks.
   */
  verify?: () => Promise<boolean>
}

/**
 * Options passed to the Vueform component factory when defining a component.
 */
export type ComponentOptions = {
  /**
   * Whether the component is a form element (participates in form data and
   * validation).
   */
  element?: boolean

  /**
   * The registered name of the component (e.g. `'VfText'`).
   */
  name: string

  /**
   * Vue component props options for the component.
   */
  props?: ComponentPropsOptions

  /**
   * The list of event names the component can emit.
   */
  emits?: string[]
}

/**
 * A Vue component extended with Vueform-specific options (`name` and
 * `element`).
 *
 * Besides Vue's `Component`, this also admits plain call signatures: generic
 * `<script setup>` SFCs compile to a function type whose `ctx` parameter is
 * narrower than `FunctionalComponent`'s, so they never match `Component`
 * structurally even though they are valid components at runtime.
 */
export type VueformComponent = (
  | Component<any, any, any>
  | ((props: any, ctx?: any, ...args: any[]) => any)
) & {
  /**
   * Whether the component is a form element (participates in form data and
   * validation).
   */
  element?: boolean

  /**
   * Whether the element supports `default`-value expression tracking (template
   * strings like `'{other} …'` that resolve from the model and auto-update).
   */
  expressionable?: boolean

  /**
   * Model metadata: returns the element's null (empty) value derived from its
   * raw schema-entry props. Used by `useModel`'s schema walk to build the model
   * without mounting components.
   *
   * @param props The element's raw schema-entry props.
   */
  nullValue?: (props: Record<string, any>) => any

  /**
   * Model metadata: returns a container element's unified child structure
   * (`ModelChildren`) derived from its raw schema-entry props. Leaf elements
   * omit it.
   *
   * @param props The element's raw schema-entry props.
   */
  children?: (props: Record<string, any>) =>
    | {
        flat?: boolean
        array?: boolean
        entries: Record<string, Record<string, any>>
      }
    | undefined
}

declare module 'vue' {
  interface ComponentCustomOptions {
    /**
     * Whether the component is a form element (participates in form data and
     * validation).
     */
    element?: boolean

    /**
     * Whether the element supports `default`-value expression tracking
     * (template strings like `'{other} …'` that resolve from the model and
     * auto-update).
     */
    expressionable?: boolean

    /**
     * Model metadata: returns the element's null (empty) value derived from its
     * raw schema-entry props. Used by `useModel`'s schema walk to build the
     * model without mounting components.
     *
     * @param props The element's raw schema-entry props.
     */
    nullValue?: (props: Record<string, any>) => any

    /**
     * Model metadata: returns a container element's unified child structure
     * derived from its raw schema-entry props. Leaf elements omit it.
     *
     * @param props The element's raw schema-entry props.
     */
    children?: (props: Record<string, any>) =>
      | {
          flat?: boolean
          array?: boolean
          entries: Record<string, Record<string, any>>
        }
      | undefined
  }
}
