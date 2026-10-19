```ts
/**
 * Inputs for the form validation view-model.
 */
type MakeFormValidationOptions = {
  /**
   * The form's validator (owned by the root element's view-model).
   */
  validator: Validator

  /**
   * The resolved form-level Standard Schema (prop, `defineSchema` attachment,
   * or attached model instance — resolution stays with the form).
   */
  validationSchema: Ref<StandardSchemaV1 | undefined>
}
```
