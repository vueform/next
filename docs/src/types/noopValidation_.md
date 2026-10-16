```ts
/**
 * The inert validation surface used when the `validation` module is not
 * registered — behaves as if validation wasn't there at all: everything is
 * valid, policy predicates return `false`, views are static and empty. Warns
 * once in dev when rules are actually provided.
 */
const noopValidation: {
  makeValidator: (options: MakeValidatorOptions) => Validator
  makeFormValidation: (options: MakeFormValidationOptions) => {
    issues: ComputedRef<Issue[]>
    toStandardSchema: () => StandardSchemaV1<unknown, unknown>
  }
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
  makeValidationOwner: (options: MakeValidationOwnerOptions) => ValidationOwner
  attachValidator: (store: object, validator: Validator) => void
  getAttachedValidator: (store: object) => Validator | undefined
  toStandardSchema: (
    source: { toStandardSchema?: () => StandardSchemaV1 } | undefined
  ) => StandardSchemaV1 | undefined
  hasValidateOnTrigger: (
    validateOn: string[] | undefined,
    events: string | string[]
  ) => boolean
  shouldValidateLive: (input: {
    hasRules: boolean
    validateOn: string[] | undefined
    invalid: boolean
    touched: boolean | undefined
    form?: { validationDisabled: boolean; submitted: boolean }
  }) => boolean
  shouldValidateOnBlur: (input: {
    validateOn: string[] | undefined
    submitted: boolean
  }) => boolean
}
```
