import type { HttpResponse } from '#core/modules/http'
import type { Component, Ref } from 'vue'
import {
  type AddonSchema,
  type ClassInput,
  type ClassValue,
  type LooseClasses,
  type OpenObject,
  type PresetDefinition,
} from '#core/types'

/**
 * Horizontal alignment options for layout and grid cells.
 */
export type AlignProp = 'left' | 'center' | 'right' | 'justify' | (string & {})

/**
 * Vertical alignment options for layout and grid cells.
 */
export type ValignProp =
  | 'top'
  | 'middle'
  | 'bottom'
  | 'baseline'
  | (string & {})

/**
 * Controls at which level validation errors are displayed.
 */
export type ErrorLevelProp = 'form' | 'element' | 'all' | 'none' | (string & {})

/**
 * Events that trigger validation on an individual element.
 */
export type ElementValidateOnProp = ('change' | 'blur' | (string & {}))[]

/**
 * Events that trigger validation at the form level, including step and submit
 * events.
 */
export type ValidateOnProp = (
  | 'change'
  | 'blur'
  | 'next'
  | 'back'
  | 'submit'
  | (string & {})
)[]

/**
 * Navigation events that trigger scrolling to the top of the form.
 */
export type ScrollTopOnProp = (
  | 'always'
  | 'next'
  | 'back'
  | 'success'
  | 'error'
  | (string & {})
)[]

/**
 * Prop type for specifying when to untrack dirty state, as a single trigger or
 * array of triggers.
 */
export type UntrackOnProp = ('input' | 'load' | (string & {}))[]

/**
 * An async handler function for submitting/autosaving form data. Return a
 * `string` to use it as the endpoint URL, an `HttpResponse` to use it as the
 * result, `false` to cancel, or void for a silent completion.
 */
export type EndpointHandler<TContext = any> = (
  data: Record<string, any>,
  context$: TContext
) =>
  | string
  | false
  | HttpResponse
  | void
  | Promise<string | false | HttpResponse | void>

/**
 * A URL string or async handler function for submitting form data.
 */
export type EndpointProp<TContext = any> = string | EndpointHandler<TContext>

/**
 * Controls where the required indicator is displayed, or `false` to disable it
 * entirely.
 */
export type ShowRequiredProp =
  | false
  | ('label' | 'placeholder' | (string & {}))[]

/**
 * Custom validation messages keyed by rule name, supporting text props.
 */
export type RuleMessagesProp<TContext = any> = Record<
  string,
  TProp<string, TContext>
>

/**
 * Language definitions mapping locale codes to display names or nested locale
 * data.
 */
export type LanguagesProp = Record<string, string | Record<string, string>>

/**
 * Resolved language definitions where each locale code maps to its display
 * name.
 */
export type ResolvedLanguagesProp = Record<string, string>

/**
 * Locale translation definitions mapping locale codes to key-value translation
 * pairs or lazy loaders.
 */
export type LocalesProp = Record<
  string,
  Record<string, string | (() => string)>
>

/**
 * A component reference that can be either a Vue component or a registered
 * component name string.
 */
export type ComponentProp = Component | string

/**
 * An array of preset definitions or preset names to apply to a component.
 */
export type PresetsProp = (string | PresetDefinition)[]

/**
 * A text value that can be a plain string, a locale object, a ref, or a
 * contextual function.
 *
 * `TContext` defaults to `any` for schema / blueprint use; component prop
 * interfaces specialize it (same pattern as event `context$`).
 *
 * @param context$ The component context when used as a function.
 */
export type TProp<T = string, TContext = any> =
  | DProp<T, TContext>
  | Record<string, T | (string & {})>

/**
 * A prop value of type `T` that can also be provided as a plain string (e.g. an
 * expression) or a contextual function returning either.
 *
 * `TContext` defaults to `any` for schema / blueprint use; component prop
 * interfaces specialize it (same pattern as event `context$`).
 *
 * @param context$ The component context when used as a function.
 * @write
 */
export type DProp<T = string, TContext = any> =
  | T
  | (string & {})
  | Ref<T | (string & {})>
  | ((context$: TContext) => T | (string & {}))
  | undefined

/**
 * Converts selected keys of a record type into `DProp` variants. Keys listed in
 * `K` become `DProp<T[K]>`, all others are excluded.
 *
 * @write
 */
export type DynamicProps<T, K extends keyof T, TContext = any> = {
  [P in K]?: DProp<T[P], TContext>
}

/**
 * A single addon entry — either a plain string, a locale object, or a full
 * addon element schema.
 */
export type AddonItem = string | Record<string, string> | AddonSchema

export type AddonProp<TContext = any> =
  | string
  | (Record<string, string> & { type?: never })
  | AddonSchema
  | AddonItem[]
  | ((context$: TContext) => string | Record<string, string> | AddonItem[])

/**
 * The heading level (1–6) corresponding to `<h1>` through `<h6>`.
 */
export type HeadingProp = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Prop keys that support expression syntax (e.g. template interpolation or
 * dynamic evaluation).
 */
export type ExpressionableKeys =
  | 'default'
  | 'label'
  | 'help'
  | 'description'
  | 'placeholder'
  | 'text'
  | 'addon'
  | (string & {}) // @todo: list all

/**
 * Controls expression resolution: `false` disables it, `true` enables it for
 * all expressionable props, an array enables it for the listed keys only.
 */
export type ExpressionsProp = boolean | ExpressionableKeys[]

/**
 * A string containing a `{...}` expression, accepted by expressionable props
 * (e.g. `default: '{source}'`) and resolved by the expression module at
 * runtime.
 */
export type ExpressionString = `${string}{${string}}${string}`

/**
 * @write
 */
export type FileProp = File | string | Record<string, any>

/**
 * Metadata object for page-type elements used in stepped/tabbed forms. Must
 * include at least a `label` for the tab/step text; additional properties are
 * exposed as arbitrary page metadata.
 */
export type PageMeta<TContext = any> = {
  label?: TProp<string, TContext>
  [key: string]: any
}

/**
 * Defines how an element appears as a page in stepped/tabbed forms.
 *
 * - `string` — plain label text.
 * - `Record<string, string>` — locale map resolved by the current language.
 * - `Ref<string | Record<string, string>>` — reactive label.
 * - `[PageMeta]` — tuple; `label` becomes the tab/step label, remaining keys are
 *   exposed as page metadata.
 * - `(context$) => string | Record<string, string> | [PageMeta]` — contextual
 *   function returning either a plain label or a metadata tuple.
 */
export type PageProp<TContext = any> =
  | string
  | Record<string, string>
  | Ref<string | Record<string, string>>
  | [PageMeta<TContext>]
  | ((
      context$: TContext
    ) => string | Record<string, string> | [PageMeta<TContext>])

/**
 * ARIA attribute overrides for accessibility on form elements.
 */
export type AriaProp = {
  /**
   * The ID of the element that labels this component.
   */
  'aria-labelledby'?: string

  /**
   * The ID of the element that describes this component.
   */
  'aria-describedby'?: string

  /**
   * Whether the field is required for form submission.
   */
  'aria-required'?: boolean

  /**
   * Whether the field is currently in an invalid state.
   */
  'aria-invalid'?: boolean

  /**
   * Whether the field is currently processing or loading.
   */
  'aria-busy'?: boolean

  [key: string]: any
}

/**
 * Allowed values for the HTML `<input>` element's `type` attribute.
 */
export type InputTypeProp =
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'month'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'
  | (string & {})

/**
 * Maps part names to their prop types using the `part:<name>` key convention.
 */
export type PartProps<T extends Record<string, any>, TContext = any> = {
  [K in keyof T & string as `part:${K}`]?: PartValue<T[K], TContext>
}

/**
 * Maps class slot names to their class value types using the `class:<name>` key
 * convention. Functional class keys also accept a plain `ClassValue`.
 */
export type ClassProps<T extends Record<string, any>, TContext = any> = {
  [K in keyof T & string as `class:${K}`]?: ClassInput<T[K], TContext>
}

/**
 * Prop type for overriding a component's classes, accepting partial class
 * definitions plus arbitrary keys. Functional class keys also accept a plain
 * `ClassValue`.
 */
export type ClassesProp<T, TContext = any> = LooseClasses<T, TContext> &
  Record<string, ClassValue | ((...args: any[]) => ClassValue)>

/**
 * Maps class slot names to their class value types using the `reclass:<name>`
 * key convention. Functional class keys also accept a plain `ClassValue`.
 */
export type ReclassProps<T extends Record<string, any>, TContext = any> = {
  [K in keyof T & string as `reclass:${K}`]?: ClassInput<T[K], TContext>
}

/**
 * Prop type for replacing a component's classes entirely, with the same shape
 * as `ClassesProp`. Functional class keys also accept a plain `ClassValue`.
 */
export type ReclassProp<T, TContext = any> = LooseClasses<T, TContext> &
  Record<string, ClassValue>

/**
 * Resolves a single part value to its allowed shapes. Every object position
 * (static value or function return type) is widened with `Record<string & {},
 * any>` so users can pass arbitrary extra attributes.
 *
 * - The static return value (object of attributes).
 * - The original function shape (for callable parts).
 * - The original function shape with the component context appended as the last
 *   parameter.
 * - For non-callable parts, a function that receives only the component context.
 */
export type PartValue<V, TContext = any> = V extends (
  ...args: infer A
) => infer R
  ?
      | OpenObject<R>
      | ((...args: A) => OpenObject<R>)
      | ((...args: [...A, TContext]) => OpenObject<R>)
  : OpenObject<V> | ((context$: TContext) => OpenObject<V>)

/**
 * Prop type for overriding a component's template parts. Each part may be
 * provided as a static value or as a function (with optional context-aware
 * variants), regardless of whether the underlying part is itself callable.
 */
export type PartsProp<T, TContext = any> = {
  [K in keyof T]?: PartValue<T[K], TContext>
}

/**
 * Prop type for replacing component slots with custom components, keyed by slot
 * name.
 */
export type SlotsProp<T> = Partial<Record<keyof T, ComponentProp>> &
  Record<string, ComponentProp>
