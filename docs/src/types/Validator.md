```ts
/**
 * The per-form (or standalone) validator: compiles rules into units, runs them,
 * and exposes projections.
 */
type Validator = {
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
```
