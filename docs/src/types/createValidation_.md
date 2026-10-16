```ts
/**
 * Creates the validation module instance: validator creation, the element /
 * form view-models, owner assembly, store attachment, and the `validateOn`
 * policy.
 *
 * @param appConfig The resolved Vueform configuration (rule registry, message
 *   tags), used as the default config for validators.
 */
function createValidation(vueform: VueformInstance): {
  /**
   * Creates a validator: one per model store, shared by the mounted form and
   * the headless engine. Standalone elements (no `form$`) create a local
   * validator.
   *
   * Owns unit compilation, scheduling, the run loop, the validation-schema run,
   * the dependency index (cross-field revalidation), and the view projections.
   *
   * @param options Validator configuration.
   */
  makeValidator: (options: MakeValidatorOptions) => Validator

  /**
   * The form-side validation view-model: installs the resolved form-level
   * Standard Schema on the validator and exposes the form's structured issues
   * and Standard Schema export.
   *
   * Must be called inside component setup — the schema watcher binds to the
   * component scope.
   *
   * @param options Form bindings.
   */
  makeFormValidation: (options: MakeFormValidationOptions) => {
    issues: ComputedRef<Issue[]>
    toStandardSchema: () => StandardSchemaV1<unknown, unknown>
  }

  /**
   * The element validation view-model: owns the element's relationship with the
   * validator (owner identity, registration, rule compilation, per-language
   * views) and interprets validation policy (`validateOn`, blur / input
   * intents). `useData` composes its projections with children-aggregation;
   * components fire intents instead of re-implementing policy.
   *
   * Must be called inside component setup — its watchers bind to the component
   * scope.
   *
   * @param options Live element bindings.
   */
  makeElementValidation: (options: MakeElementValidationOptions) => {
    validator: Validator
    owner: ValidationOwner
    validation: ShallowReactive<Record<string, ValidationView>>
    currentValidation: Readonly<Ref<ValidationView, ValidationView>>
    hasOwnValidation: ComputedRef<boolean>
    shouldValidate: ComputedRef<boolean>
    success: ComputedRef<boolean>
    required: ComputedRef<boolean>
    invalidLanguages: ComputedRef<Set<string>>
    ownInvalid: ComputedRef<boolean>
    ownPending: ComputedRef<boolean>
    ownDebouncing: ComputedRef<boolean>
    ownValidated: ComputedRef<boolean>
    ownRuleErrors: ComputedRef<string[]>
    validateSelf: () => Promise<boolean>
    validateCurrent: () => Promise<boolean>
    invalidateSelf: () => void
    unvalidateSelf: () => void
    notifyChange: () => void
    onUserInput: () => void
    onBlur: () => void
    initValidation: () => void
    destroyValidation: () => void
  }

  /**
   * Assembles a `ValidationOwner` from live bindings — the single owner shape
   * shared by mounted elements (`makeElementValidation`) and headless nodes
   * (the model engine). Language listing and per-language value slicing are
   * translatable-aware here so neither side re-implements them.
   *
   * @param options Owner bindings.
   */
  makeValidationOwner: (options: MakeValidationOwnerOptions) => ValidationOwner

  /**
   * Associates a validator with a model store.
   *
   * @param store The model store.
   * @param validator The validator to attach.
   */
  attachValidator: (store: object, validator: Validator) => void

  /**
   * Returns the validator attached to a model store, if any.
   *
   * @param store The model store.
   */
  getAttachedValidator: (store: object) => Validator | undefined

  /**
   * Exposes a form context or model instance as a Standard Schema. The source
   * must own a validator (`form$.toStandardSchema` /
   * `instance.toStandardSchema`).
   *
   * Interaction-dependent rules (e.g. `captcha`) are skipped. See the
   * validation guide for limitations.
   *
   * @param source A form context or model instance.
   */
  toStandardSchema: (
    source: { toStandardSchema?: () => StandardSchemaV1 } | undefined
  ) => StandardSchemaV1 | undefined

  /**
   * Whether a `validateOn` trigger list includes any of the given events.
   *
   * @param validateOn The resolved trigger list.
   * @param events One or more trigger events to test.
   */
  hasValidateOnTrigger: (
    validateOn: string[] | undefined,
    events: string | string[]
  ) => boolean

  /**
   * The single interpretation of when an element validates as the user
   * interacts (typing / changing values):
   *
   * - never without rules, or when the form suppresses validation
   * - always once the form has been submitted
   * - when already invalid (so errors clear as they are fixed)
   * - on the `change` trigger
   * - on the `blur` trigger once the element has been touched
   *
   * Standalone elements (no form) validate live whenever they have rules.
   *
   * @param input Policy inputs.
   */
  shouldValidateLive: (input: {
    hasRules: boolean
    validateOn: string[] | undefined
    invalid: boolean
    touched: boolean | undefined
    form?: { validationDisabled: boolean; submitted: boolean }
  }) => boolean

  /**
   * Whether a blur event should trigger validation of the current language:
   * only before the first submit (afterwards live validation covers it), and
   * only when `blur` is among the triggers.
   *
   * @param input Blur policy inputs.
   */
  shouldValidateOnBlur: (input: {
    validateOn: string[] | undefined
    submitted: boolean
  }) => boolean
}
```
