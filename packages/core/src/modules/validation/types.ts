import type { ComputedRef } from 'vue'

import type { VueformInstance } from '#core/helpers'
import type { ConditionalProp } from '#core/modules/conditions'
import {
  type FormContext,
  type StatefulElement,
  type StandardSchemaV1,
} from '#core/types'

import type { RULE_BRAND } from './symbols'

/**
 * Union of all known validation rule names — built-in rules plus any
 * user-registered custom rules from `CustomRules`.
 */
type RuleName = BuiltInRules | keyof CustomRules

/**
 * A single validation rule string — either a bare rule name or a rule with
 * colon-separated parameters (e.g. `'min:3'`). Accepts custom rule names via
 * the `string & {}` fallback.
 */
type RuleString = RuleName | `${RuleName}:${string}` | (string & {})

// Extracts parameter keys that require string values.
type RequiredStringParamKeys<T extends readonly string[]> = {
  [I in keyof T]: T[I] extends `${string}$?`
    ? never
    : T[I] extends `${string}?`
      ? never
      : T[I] extends `${infer K}$`
        ? K
        : T[I]
}[number] &
  string

// Extracts parameter keys that require element path references.
type RequiredElementParamKeys<T extends readonly string[]> = {
  [I in keyof T]: T[I] extends `${infer K}$`
    ? T[I] extends `${string}?`
      ? never
      : `${K}$`
    : never
}[number] &
  string

// Extracts parameter keys with optional string values.
type OptionalStringParamKeys<T extends readonly string[]> = {
  [I in keyof T]: T[I] extends `${infer K}?`
    ? T[I] extends `${string}$?`
      ? never
      : K
    : never
}[number] &
  string

// Extracts parameter keys with optional element path references.
type OptionalElementParamKeys<T extends readonly string[]> = {
  [I in keyof T]: T[I] extends `${infer K}$?` ? `${K}$` : never
}[number] &
  string

/**
 * Union of all built-in validation rule names shipped with Vueform.
 */
export type BuiltInRules =
  | 'accepted'
  | 'after'
  | 'after_or_equal'
  | 'alpha'
  | 'alpha_dash'
  | 'alpha_num'
  | 'array'
  | 'before'
  | 'before_or_equal'
  | 'between'
  | 'boolean'
  | 'captcha'
  | 'confirmed'
  | 'date'
  | 'date_equals'
  | 'date_format'
  | 'different'
  | 'digits'
  | 'digits_between'
  | 'dimensions'
  | 'distinct'
  | 'email'
  | 'file'
  | 'filled'
  | 'gt'
  | 'gte'
  | 'image'
  | 'in'
  | 'in_array'
  | 'integer'
  | 'ip'
  | 'ipv4'
  | 'ipv6'
  | 'json'
  | 'lt'
  | 'lte'
  | 'max'
  | 'mimes'
  | 'mimetypes'
  | 'min'
  | 'not_in'
  | 'not_regex'
  | 'nullable'
  | 'numeric'
  | 'regex'
  | 'required'
  | 'same'
  | 'size'
  | 'string'
  | 'timezone'
  | 'url'
  | 'uuid'

/**
 * Value categories used for size-based validation rules.
 */
export type SizeTypes = 'array' | 'string' | 'number' | 'file' | undefined

/**
 * Augmentable interface for registering custom validation rule names. Augment
 * this via module declaration merging to add autocomplete for custom rules:
 *
 * ```ts
 * declare module '@vueform/core' {
 *   interface CustomRules {
 *     phone: true
 *     slug: true
 *   }
 * }
 * ```
 */
export interface CustomRules {}

/**
 * A rule or rule set that only runs when `$if` is met. `rules` accepts the same
 * forms as `RulesProp` (string, array, rule definition, Standard Schema).
 */
export type ConditionalRule<TContext = any> = {
  /**
   * The rule or rules to apply while `$if` is true.
   */
  rules: RulesProp<TContext>

  /**
   * Conditions that must be met for `rules` to activate. Same syntax as element
   * `conditions`.
   */
  $if: ConditionalProp<TContext>
}

/**
 * A validation rules definition as a pipe-separated string, a Standard Schema
 * (Zod, Valibot, ArkType, …), a rule definition, a conditional rule, or an
 * array of strings, conditional rules, rule definitions, or Standard Schemas.
 */
export type RulesProp<TContext = any> =
  | RuleString
  | `${RuleName}|${string}`
  | `${RuleName}:${string}|${string}`
  | StandardSchemaV1
  | RuleDefinition
  | ConditionalRule<TContext>
  | (
      | RuleString
      | ConditionalRule<TContext>
      | RuleDefinition
      | StandardSchemaV1
    )[]

/**
 * RulesProp keyed by language for multilingual validation.
 */
export type TOnlyRulesProp<TContext = any> = Record<string, RulesProp<TContext>>

/**
 * The full rules prop type: either a single rule set or a language-keyed
 * object.
 */
export type TRulesProp<TContext = any> =
  | RulesProp<TContext>
  | TOnlyRulesProp<TContext>

/**
 * A single `validateOn` trigger.
 */
export type ValidateOnTrigger = 'change' | 'blur' | 'next' | 'back' | 'submit'

/**
 * A structured validation issue produced by a field or model unit.
 */
export type Issue = {
  /**
   * The element path the issue belongs to (`''` for root / unmatched).
   */
  path: string

  /**
   * The language key when the issue comes from a translatable rule set.
   */
  language?: string

  /**
   * The rule name that produced the issue (e.g. `'required'`, `'min'`,
   * `'standard_schema'`, `'validation_schema'`).
   */
  rule: string

  /**
   * The resolved, localized error message.
   */
  message: string
}

/**
 * Options for defining a custom validation rule including check and message
 * functions.
 */
export type RuleOptions<T extends readonly string[] | true = true> = {
  debounce?: number
  params?: T
  typed?: boolean
  /**
   * Extra element paths this rule depends on (beyond `$`-suffixed params). When
   * a dependency's value changes the rule revalidates, gated the same way as
   * `$`-param dependents (skip untouched, never-validated elements unless the
   * form has submitted).
   */
  deps?: string[] | ((ctx: CheckContext<T>) => string[])
  message?: string | ((messageContext: MessageContext<T>) => string)
  /**
   * Extra or overriding placeholders for the error message. Merged on top of
   * the default params (`attribute` plus declared rule params).
   */
  messageParams?: (
    messageContext: MessageContext<T>
  ) => Record<string, string | number | undefined>
  transformParams?: (context: { params: RawParams<T> }) => RawParams<T>
}

// ================= RULE / OWNER SURFACE =================

/**
 * Function that performs the actual validation check.
 */
export type RuleChecker<T extends readonly string[] | true = true> = (
  value: any,
  ruleContext: CheckContext<T>
) => boolean | string | Promise<boolean | string>

/**
 * A single rule argument: positional (`min(3)`) or named (`min({ min: 3 })`).
 */
export type RuleAttribute = { value: string; name?: string }

/**
 * A stateless validation rule produced by `createRule`. Callable with
 * parameters to produce a configured copy (`min(3)`, `min({ min: 3 })`).
 */
export type RuleDefinition<T extends readonly string[] | true = any> = ((
  ...args: any[]
) => RuleDefinition<T>) & {
  readonly [RULE_BRAND]: true
  readonly name: string
  readonly options?: RuleOptions<T>
  readonly attributes: RuleAttribute[]
  readonly conditions?: ConditionalProp
  readonly debounce: number
  readonly check: RuleChecker<T>
}

/**
 * Live bindings the validator reads from an owner. Paths and values are
 * functions so list reorders don't require re-registration.
 */
export type ValidationOwner = {
  /**
   * Stable identity. Units are keyed by this, not by path, so validation state
   * survives list reorders.
   */
  id: object

  /**
   * The element (or virtual element) the check context is built from.
   */
  el$: StatefulElement

  /**
   * Current element path (`''` for the form / model root).
   */
  path: () => string

  /**
   * Current data path — where the owner's value lives in the model. Falls back
   * to `path()` when absent. Store write notifications match owners by this, so
   * it matters where the two diverge (flat containers).
   */
  dataPath?: () => string

  /**
   * Language keys to compile (`['default']` when not translatable).
   */
  languages: () => string[]

  /**
   * The value to validate for a language.
   */
  getValue: (language?: string) => any

  /**
   * Whether to stop after the first failing unit.
   */
  bail?: () => boolean

  /**
   * Element-level debounce fallback.
   */
  debounce?: () => number

  /**
   * Whether the owner has been touched (blur). Used to gate dependent
   * revalidation.
   */
  touched?: () => boolean

  /**
   * Whether the owner is currently available. Unavailable owners are skipped
   * during whole-form / headless sweeps.
   */
  available?: () => boolean
}
/**
 * Context object passed to rule check functions, providing access to the
 * element, form, module instances, and utility helpers.
 */
export type RuleContext = {
  /**
   * The element instance being validated.
   */
  el$: StatefulElement

  /**
   * The parent form context, if available.
   */
  form$?: FormContext

  /**
   * The Vueform instance the rule runs under: its `config`, `$locale`, and the
   * module doorways (`getDateModule(vueform)`, `useDate(v, f, vueform)`).
   */
  vueform: VueformInstance

  /**
   * The size-type category of the element (`'string'`, `'number'`, `'array'`,
   * or `'file'`).
   */
  type: SizeTypes

  /**
   * The element's human-readable display name for error messages.
   */
  attribute: string

  /**
   * Returns whether a value is considered non-empty by the element.
   *
   * @param value The value to check.
   */
  filled: (value: any) => boolean

  /**
   * Returns the size of a value according to the element's type (length,
   * numeric value, file size in KB, or array length).
   *
   * @param value The value to measure.
   * @param el$ Optional element to derive the type from.
   */
  size: (value: any, el$?: StatefulElement) => number | undefined

  /**
   * Derives the size-type category for a given element.
   *
   * @param el$ The element to inspect.
   */
  getType: (el$: StatefulElement) => SizeTypes

  /**
   * Looks up another element by path, resolving wildcards relative to the
   * current element.
   *
   * @param path The target element path.
   */
  getOther$: (path: string) => StatefulElement | undefined
}
/**
 * Resolved validator parameters combining required and optional params.
 */
export type ValidatorParams<T extends readonly string[] | true = string[]> =
  T extends readonly string[]
    ? {
        [K in RequiredStringParamKeys<T>]: string
      } & {
        [K in RequiredElementParamKeys<T>]: StatefulElement | undefined
      } & {
        [K in OptionalStringParamKeys<T>]?: string
      } & {
        [K in OptionalElementParamKeys<T>]?: StatefulElement
      }
    : string[]

/**
 * Resolved message parameters combining string and element params.
 */
export type MessageParams<T extends readonly string[] | true = string[]> =
  T extends readonly string[]
    ? {
        [K in RequiredStringParamKeys<T>]: string
      } & {
        [K in RequiredElementParamKeys<T>]: StatefulElement | undefined
      } & {
        [K in OptionalStringParamKeys<T>]?: string
      } & {
        [K in OptionalElementParamKeys<T>]?: StatefulElement
      } & {
        attribute: string
      }
    : {
        attribute: string
      }

/**
 * Context passed to rule message formatters including resolved parameters.
 */
export type MessageContext<T extends readonly string[] | true = true> =
  RuleContext & {
    params: MessageParams<T>
  }

/**
 * Context passed to rule check functions including resolved parameters.
 */
export type CheckContext<T extends readonly string[] | true = true> =
  RuleContext & {
    params: ValidatorParams<T>
  }

/**
 * Raw unprocessed parameter tuple as received from rule parsing.
 */
export type RawParams<T extends readonly string[] | true = string[]> =
  T extends readonly string[]
    ? {
        [K in T[number] as K extends `${string}?` ? never : K]: string
      } & {
        [K in T[number] as K extends `${infer V}?` ? V : never]?: string
      }
    : string[]

/**
 * Per-language (or `'default'`) read-only view of an owner's validation state.
 * Shape-compatible with the former `ElementValidation` so `el$.validation` /
 * `el$.currentValidation` keep working.
 */
export type ValidationView = {
  /**
   * The language key used for multilingual validation.
   */
  language: string | undefined

  /**
   * Whether any active unit is currently invalid.
   */
  invalid: ComputedRef<boolean>

  /**
   * Whether any async unit is awaiting a result.
   */
  pending: ComputedRef<boolean>

  /**
   * Whether any unit is waiting for its debounce timer.
   */
  debouncing: ComputedRef<boolean>

  /**
   * Whether validation is pending or debouncing.
   */
  busy: ComputedRef<boolean>

  /**
   * Whether a `required` or `accepted` unit is active.
   */
  required: ComputedRef<boolean>

  /**
   * Aggregated error messages from invalid units.
   */
  errors: ComputedRef<string[]>

  /**
   * Structured issues from invalid units.
   */
  issues: ComputedRef<Issue[]>

  /**
   * Whether every active unit has been run at least once.
   */
  validated: ComputedRef<boolean>

  /**
   * Runs this language's units against the given value (or the owner's current
   * value when omitted).
   *
   * @param value The value to validate.
   */
  validate: (value?: any) => Promise<boolean>

  /**
   * Marks units as not yet validated, requiring re-validation.
   */
  invalidate: () => void

  /**
   * Resets units to their initial state.
   */
  reset: () => void
}

/**
 * Per-owner rollup of validation state across languages, plus per-language
 * views.
 */
export type OwnerView = {
  /**
   * Per-language views keyed by language (`'default'` when not translatable).
   */
  languages: Record<string, ValidationView>

  /**
   * Whether any language is invalid.
   */
  invalid: ComputedRef<boolean>

  /**
   * Whether any language is pending.
   */
  pending: ComputedRef<boolean>

  /**
   * Whether any language is debouncing.
   */
  debouncing: ComputedRef<boolean>

  /**
   * Whether every language has been validated.
   */
  validated: ComputedRef<boolean>

  /**
   * Aggregated error messages across languages.
   */
  errors: ComputedRef<string[]>

  /**
   * Structured issues across languages.
   */
  issues: ComputedRef<Issue[]>
}

/**
 * The per-form (or standalone) validator: compiles rules into units, runs them,
 * and exposes projections.
 */
export type Validator = {
  /**
   * All structured issues from registered owners and the model unit, including
   * root-bucket (`''`) issues.
   */
  issues: ComputedRef<Issue[]>

  /**
   * Localized error messages from `issues`.
   */
  errors: ComputedRef<string[]>

  /**
   * Whether any registered available owner (or the model root bucket) is
   * invalid.
   */
  invalid: ComputedRef<boolean>

  /**
   * Whether any registered owner has a pending async unit.
   */
  pending: ComputedRef<boolean>

  /**
   * Whether any registered owner is debouncing.
   */
  debouncing: ComputedRef<boolean>

  /**
   * Whether the validator is subscribed to a model store's write notifications.
   * When `true`, change notification is store-driven and call sites don't need
   * to invoke `onChange` on value writes.
   */
  wired: boolean

  /**
   * Registers an owner (or updates its live bindings when already registered).
   * Compiling rules is a separate `setRules` call.
   *
   * @param owner The owner to register.
   */
  register: (owner: ValidationOwner) => void

  /**
   * Removes an owner and all of its units.
   *
   * @param owner The owner to remove.
   */
  unregister: (owner: ValidationOwner) => void

  /**
   * Compiles `rules` into field units for the owner, replacing any previous
   * field units. Pass `undefined` to drop field units.
   *
   * @param owner The owner whose rules changed.
   * @param rules The new rules definition.
   */
  setRules: (owner: ValidationOwner, rules?: TRulesProp) => void

  /**
   * Installs or clears the form-level Standard Schema (one model unit).
   *
   * @param schema The schema to run against the whole model, or `undefined`.
   */
  setValidationSchema: (schema?: StandardSchemaV1) => void

  /**
   * Runs units. With an owner, runs that owner's field units (optionally one
   * language) and the model unit. With no owner, runs every registered
   * available owner plus the model unit.
   *
   * @param owner Optional owner to limit the run.
   * @param language Optional language to limit the run.
   */
  validate: (owner?: ValidationOwner, language?: string) => Promise<boolean>

  /**
   * Marks an owner's units as not yet validated.
   *
   * @param owner The owner to invalidate.
   */
  invalidate: (owner: ValidationOwner) => void

  /**
   * Resets an owner's units to their initial state.
   *
   * @param owner The owner to reset.
   */
  reset: (owner: ValidationOwner) => void

  /**
   * Notifies the validator that `path`'s value changed: dirties the model unit
   * and revalidates field units that depend on `path` (gated like today's
   * `$`-param watchers).
   *
   * @param path The element path that changed.
   */
  onChange: (path: string) => void

  /**
   * Re-resolves an owner's dependency index after its path changed (e.g. a list
   * reorder), so wildcard-resolved dep paths keep pointing at the right
   * targets. Unit state is preserved.
   *
   * @param owner The owner whose path changed.
   */
  repath: (owner: ValidationOwner) => void

  /**
   * Returns (creating if needed) the projection for an owner.
   *
   * @param owner The owner to project.
   */
  view: (owner: ValidationOwner) => OwnerView

  /**
   * Exposes this validator as a Standard Schema (validate an arbitrary value
   * against the compiled units).
   */
  toStandardSchema: () => StandardSchemaV1
}

/**
 * The validation module instance: validator creation, view-models, owner
 * assembly, store attachment, and the `validateOn` policy. Validators are
 * created per form / model store.
 */
export type ValidationModule = ReturnType<
  typeof import('./createValidation').createValidation
>

/**
 * Configuration options for the validation module (`config.$validation`).
 */
export interface ValidationModuleOptions {}
