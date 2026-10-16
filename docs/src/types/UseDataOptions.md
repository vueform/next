```ts
/**
 * Configuration options for the useData composable.
 */
type UseDataOptions = {
  /**
   * The element's own children registry. Children with the `hoist` prop have
   * their errors surfaced by this element.
   */
  children: VueformChildren

  /**
   * The element's name, used as the key in the parent model and for
   * registration.
   */
  name?: Ref<ElementName>

  /**
   * Whether the element is currently available (visible). Unavailable elements
   * are excluded from form data.
   */
  available?: Ref<boolean>

  /**
   * The element's path in the form tree (e.g. `address.city`).
   */
  path?: Ref<string>

  /**
   * The element's dot-notation data path in the root model.
   */
  dataPath?: Ref<string>

  /**
   * The parent container context that owns the model this element reads from
   * and writes to.
   */
  container?: ContainerContext

  /**
   * The external `v-model` ref bound by the parent, if any.
   */
  modelValue?: Ref<any>

  /**
   * Validation rules to apply to this element. Can be multilingual when
   * `translatable` is `true`.
   */
  rules?: Ref<TRulesProp | undefined>

  /**
   * Maximum number of error messages to display at once.
   */
  maxErrors?: Ref<number | undefined>

  /**
   * Whether this element pushes its errors to its nearest ancestor element.
   */
  hoist?: Ref<boolean | undefined>

  /**
   * Whether the value is included in form submission data.
   */
  submit?: Ref<boolean | undefined>

  /**
   * Whether the element holds sensitive data, excluded from locally stored
   * autosave drafts.
   */
  sensitive?: Ref<boolean | undefined>

  /**
   * The element-specific null value override. When translatable, this is
   * expanded into a per-language object.
   */
  nullValue?: Ref<any>

  /**
   * The value representing the "on" / checked state. Used by checkbox-style
   * inputs to determine the model value when checked.
   */
  trueValue?: MaybeRef<any>

  /**
   * The value representing the "off" / unchecked state. When defined, it is
   * used as the default null value and the element is considered empty when its
   * model equals this value.
   */
  falseValue?: MaybeRef<any>

  /**
   * Whether the element accepts multiple values. When true, the default null
   * value is an empty array instead of `null`.
   */
  multiple?: MaybeRef<Booleanish | undefined>

  /**
   * A ref tracking whether the user has interacted with this element.
   */
  touched?: Ref<boolean>

  /**
   * An explicit initial model value, bypassing the default coalescing logic.
   */
  startupModel?: Ref<any>

  /**
   * The raw default value or expression for the element. When translatable,
   * expanded to a per-language object with expression resolution.
   */
  default?: Ref<any>

  /**
   * Custom validation messages keyed by rule name, resolved as text props.
   */
  ruleMessages?: Ref<RuleMessagesProp | undefined>

  /**
   * A function to transform outgoing data when reading the element's `payload`
   * computed.
   */
  transformPayload?: Ref<((value: any, context$: any) => any) | undefined>

  /**
   * The element's unique DOM id, used to derive sub-region ids like
   * `languageId`.
   */
  id?: Ref<string>

  /**
   * Pre-resolved translatable flag from makeMultilingual. When provided,
   * useData uses it instead of computing its own.
   */
  translatable?: ComputedRef<boolean>

  /**
   * Pre-resolved active language ref from makeMultilingual. When provided,
   * useData uses it instead of creating its own.
   */
  language?: Ref<string>

  /**
   * Pre-resolved languages map from makeMultilingual. When provided, useData
   * uses it instead of computing its own.
   */
  languages?: Ref<ResolvedLanguagesProp>

  /**
   * Pre-resolved language indicator DOM id from makeMultilingual. When
   * provided, useData uses it instead of computing its own.
   */
  languageId?: ComputedRef<string | undefined>

  /**
   * Whether this element aggregates children's data as a nested container
   * (group, list, grid, matrix, form).
   */
  nested?: MaybeRef<boolean | undefined>

  /**
   * The items definition for dynamic list containers (array of schemas or a
   * count). Only relevant when `nested` is `true`.
   */
  rows?: Ref<any[] | number | undefined>

  /**
   * Whether this element operates as the form root, owning the root model:
   * adopting a `useModel` instance passed via `modelValue`, or creating an
   * internal store from the plain `modelValue`. Mutually exclusive with
   * `container`.
   */
  root?: boolean

  /**
   * When set, the model value is cast to the specified type before being stored
   * or read. Values that are `null` or `undefined` are not cast.
   */
  cast?: CastOption
} & FeatureEvents<{
  /**
   * Fired when the element's value is reset to its default.
   *
   * @param context$ The element's component context.
   */
  reset: [context$: any]

  /**
   * Fired when the element's value is cleared to its null value.
   *
   * @param context$ The element's component context.
   */
  clear: [context$: any]

  /**
   * Fired when the element's value is loaded programmatically via the `load`
   * method.
   *
   * @param value The loaded value.
   * @param context$ The element's component context.
   */
  load: [value: any, context$: any]

  /**
   * Fired when the element's value changes.
   *
   * @param newValue The new element value.
   * @param oldValue The previous element value.
   * @param context$ The element's component context.
   */
  change: [newValue: any, oldValue: any, context$: any]

  /**
   * Fired to update the v-model binding.
   *
   * @param value The new model value.
   */
  'update:modelValue': [value: any]

  /**
   * Fired when the element's validation state turns valid.
   *
   * @param context$ The element's component context.
   */
  valid: [context$: any]

  /**
   * Fired when the element's validation state turns invalid.
   *
   * @param context$ The element's component context.
   */
  invalid: [context$: any]
}>
```
