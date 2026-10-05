import type { ExpressionString, LooseContext, FileProp } from '#core/types'

/**
 * @write
 */
export type TextModel = string | null

/**
 * @write
 */
export type TextArrayModel = string[]

/**
 * @write
 */
export type TextMaybeArrayModel = string | string[] | null

/**
 * @write
 */
export type TextishModel = string | number | null

/**
 * @write
 */
export type TextishArrayModel = (string | number)[]

/**
 * @write
 */
export type TextishMaybeArrayModel =
  | string
  | number
  | null
  | (string | number)[]

/**
 * @write
 */
export type DateModel = Date | string | (Date | string)[] | null

/**
 * Wide file model (single file, list, or empty). Prefer `FileModelOf` /
 * `FileModelProp` when the shape should follow a `multiple` prop.
 */
export type FileModel = FileProp | FileProp[] | null

/**
 * File element model shaped by `multiple`:
 *
 * Values are `FileProp` (File instance, URL/filename string, or a FileObject
 * for pre-existing uploads) — the same contract the runtime normalizes.
 *
 * - `multiple: false` — `FileProp | null`
 * - `multiple: true` — `FileProp[]`
 * - `multiple` unset / wide `boolean` — `FileProp | FileProp[] | null`
 */
export type FileModelOf<TMultiple extends boolean = boolean> = [
  boolean,
] extends [TMultiple]
  ? FileProp | FileProp[] | null
  : [TMultiple] extends [true]
    ? FileProp[]
    : FileProp | null

/**
 * Model / default prop type for file elements — `NoInfer` so `modelValue` does
 * not compete with `multiple` when inferring generics.
 */
export type FileModelProp<TMultiple extends boolean = boolean> = NoInfer<
  FileModelOf<TMultiple>
>

/**
 * @write
 */
export type ObjectModel = Record<string, any>

/**
 * @write
 */
export type ArrayModel = any[]

/**
 * A model value that supports multilingual content as a locale-keyed object, or
 * a plain scalar. Record values include `undefined` so partially provided
 * locale objects (optional keys) stay assignable — missing languages are
 * initialized by the element at runtime.
 */
export type TranslatableModel =
  | Record<string, string | number | null | undefined>
  | string
  | number
  | null

/**
 * Props for elements with a model value (`v-model`) and optional
 * submit/transform hooks. Use `ModelPropsWithDefault` when the element also has
 * a `default` prop — plain interfaces so Vue's SFC compiler can resolve
 * `extends` chains.
 */
export interface ModelProps<T = any, TContext = any> {
  /**
   * The current value of the element (v-model).
   */
  modelValue?: T

  /**
   * Whether the element value is included in form submission data.
   */
  submit?: boolean

  /**
   * Whether the element holds sensitive data (passwords, payment details, …).
   * Sensitive values are excluded from locally stored autosave drafts. On a
   * container, the whole subtree is excluded.
   */
  sensitive?: boolean

  /**
   * Transforms the element's value when submitting the form.
   *
   * @param value The raw value being submitted.
   * @param context$ The element's component context.
   */
  transformPayload?: (value: any, context$: TContext) => any
}

/**
 * `ModelProps` plus a core-style `default` prop (same type as `modelValue`).
 */
export interface ModelPropsWithDefault<
  T = any,
  TContext = any,
> extends ModelProps<T, TContext> {
  /**
   * The default/initial value of the element. Being expressionable, a `{...}`
   * expression string is accepted alongside the model type.
   */
  default?: T | ExpressionString
}

/**
 * @write
 */
export interface ModelEmits<T = any, TContext = LooseContext> {
  /**
   * Emitted when the element value changes.
   *
   * @param newValue The new element value.
   * @param oldValue The previous element value.
   * @param context$ The component context.
   */
  change: [newValue: T, oldValue: T, context$: TContext]

  /**
   * Emitted to update the v-model binding.
   *
   * @param value The new model value.
   */
  'update:modelValue': [value: T]

  /**
   * Emitted when the element's value is loaded programmatically via the `load`
   * method.
   *
   * @param value The loaded model value.
   * @param context$ The element's component context.
   */
  load: [value: T, context$: TContext]

  /**
   * Emitted when the element is reset to its default value.
   *
   * @param context$ The element's component context.
   */
  reset: [context$: TContext]

  /**
   * Emitted when the element's value is cleared.
   *
   * @param context$ The element's component context.
   */
  clear: [context$: TContext]
}

/**
 * Props for the element's default/initial value.
 *
 * @deprecated Use `ModelPropsWithDefault` instead.
 */
export type DefaultProps<T = any> = Pick<ModelPropsWithDefault<T>, 'default'>
