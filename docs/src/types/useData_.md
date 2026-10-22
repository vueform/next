```ts
/**
 * Manages element-level data, validation state, error handling, and lifecycle
 * for all stateful form elements — leaf inputs, containers, and the form root.
 *
 * @param options Element data configuration object.
 */
function useData(options: UseDataOptions): {
  validation: ShallowReactive<Record<string, ValidationView>>
  currentValidation: Readonly<Ref<ValidationView, ValidationView>>

  /**
   * The validator instance the element is registered with: the form's
   * validator, a store-attached one, or a newly created one.
   */
  validator: Validator

  shouldValidate: ComputedRef<boolean>
  onUserInput: () => void

  /**
   * Whether this element acts as a data container (group, list, grid, or root).
   */
  isContainer: Readonly<Ref<boolean, boolean>>

  /**
   * Whether the element's data is flattened into the parent container rather
   * than nested under its own `name` key.
   */
  isFlatContainer: ComputedRef<boolean>

  /**
   * The model ref the element provides to its children via the container
   * context: the parent's model for flat containers, the element's own `model`
   * otherwise.
   */
  containerModel: ComputedRef<unknown>

  /**
   * Updates the element's model value. Container elements perform a deep merge;
   * leaf elements set the value directly.
   *
   * @param data The new value or data to merge.
   */
  update: (data: any) => void

  /**
   * Handles a native input event and updates the model from the event target.
   *
   * @param data The native DOM event from the input.
   */
  handleModelUpdate: (data: Event) => void

  /**
   * Resets the element to its initial model state and fires the `reset` event.
   */
  reset: () => void

  /**
   * Clears the element to its null value and fires the `clear` event.
   */
  clear: () => void

  /**
   * Loads data into the element and fires the `load` event, cascading to all
   * children.
   *
   * @param data The new value or data to load.
   */
  load: (data: any) => void

  /**
   * Runs validation on the element's own rules and all children, returning
   * whether everything is valid.
   *
   * @param options Pass `force: true` to re-validate every element, ignoring
   *   current results.
   */
  validate: (options?: { force?: boolean }) => Promise<boolean>

  validateSelf: () => Promise<boolean>

  /**
   * Validates stateful children, returning whether all are valid. By default
   * only incomplete children run.
   *
   * @param options Pass `force: true` to re-validate all children, ignoring
   *   current results.
   */
  validateChildren: (options?: { force?: boolean }) => Promise<boolean>

  validateCurrent: () => Promise<boolean>

  /**
   * Resets all validation state, including children's.
   */
  unvalidate: () => void

  /**
   * Marks all validation instances as invalidated, requiring revalidation.
   */
  invalidate: () => void

  /**
   * Marks the element as clean by updating the initial model snapshot.
   */
  clean: () => void

  /**
   * Clears all error messages from the message bag.
   */
  clearErrors: () => void

  /**
   * Clears all custom messages from the message bag.
   */
  clearMessages: () => void

  /**
   * Clears the entire message bag, removing both errors and messages.
   */
  clearMessageBag: () => void

  /**
   * Adds one or more items to a dynamic list.
   *
   * @param count The number of items to add.
   */
  add: (count?: number) => Promise<void>

  /**
   * Removes an item from a dynamic list by index.
   *
   * @param index The index of the item to remove. Defaults to the last item.
   */
  remove: (index?: number) => void

  /**
   * Sorts a dynamic list by moving an item from one data index to another.
   *
   * @param fromIndex The source data index of the item to move.
   * @param toIndex The destination data index for the item.
   */
  sort: (fromIndex: number, toIndex: number) => Promise<void>

  /**
   * Checks whether a value is considered filled.
   *
   * @param value The value to check.
   */
  filled: (value: any) => boolean

  /**
   * Whether the element's `default` expression is currently tracked and
   * auto-updating the value.
   */
  tracking: ComputedRef<boolean>

  /**
   * Resumes expression tracking after an untrack, immediately re-writing the
   * resolved value.
   */
  track: () => void

  /**
   * Stops expression tracking, leaving the current value in place.
   */
  untrack: () => void

  /**
   * Initializes the element's model and validation.
   */
  init: () => void

  /**
   * Reinitializes the element by rebuilding both its model registration and
   * validation instances.
   */
  reinit: () => void

  /**
   * Destroys the element by tearing down validation, model, and unregistering
   * from the container.
   */
  destroy: () => void

  /**
   * Registers the element with its parent container context using its path and
   * initial model.
   */
  register: () => void

  /**
   * Unregisters the element from its parent container context.
   *
   * @param unregisterDataPath The data path to unregister.
   */
  unregister: (unregisterDataPath?: string) => void

  /**
   * Registers the element's model key in its parent container.
   */
  initModel: (() => void) | (() => void)

  /**
   * Reinitializes the model by destroying and re-registering it with the
   * container.
   *
   * @param unregisterDataPath The data path to unregister before
   *   re-registering.
   */
  reinitModel: (unregisterDataPath?: string) => void

  /**
   * Removes the element's model key from its parent container.
   */
  destroyModel: (() => void) | (() => void)

  initValidation: () => void
  destroyValidation: () => void
  invalidLanguages: ComputedRef<Set<string>> | undefined

  /**
   * The data index of the item currently being dragged in a sortable list.
   */
  dragIndex: Ref<any, any>

  /**
   * The data index where the dragged item will be dropped.
   */
  dropIndex: Ref<any, any>

  /**
   * The resolved, display-ordered items for dynamic container elements. Each
   * entry pairs the stable item `id` with its canonical data `index`.
   */
  items: ComputedRef<any[]> | undefined

  /**
   * The current language-aware value of the element. For translatable elements,
   * returns the value for the active language.
   */
  value: WritableComputedRef<any, any>

  /**
   * The reactive model object holding all element values.
   */
  model: Ref<Record<string, any>, Record<string, any>> | ComputedRef<any>

  /**
   * A snapshot of the model at creation time (re-snapshotted by `clean()`),
   * used for dirty checking and reset.
   */
  initialModel: Ref<any, any> | Ref<Record<string, any>, Record<string, any>>

  /**
   * The root model backing the form when this element operates as the form
   * root, `undefined` for every other element.
   */
  rootModel: RootModel | undefined

  /**
   * The element's submission payload. Container elements aggregate from
   * children; leaf elements return their own value.
   */
  payload: ComputedRef<Record<ElementName, any>>

  /**
   * The dot-notation path to this element's value within the form data object
   * (e.g. `"address.city"`). Empty string for the root model. Flat containers
   * inherit their parent's data path.
   */
  dataPath: Readonly<Ref<string, string>>

  /**
   * The root data paths of the model subtree this element's data occupies.
   */
  ownDataPaths: ComputedRef<string[]>

  /**
   * Data paths holding sensitive data (`sensitive: true`) within this element's
   * subtree — excluded from locally stored drafts.
   */
  sensitivePaths: ComputedRef<string[]>

  /**
   * The value the element holds when it is considered empty. For translatable
   * elements a per-language object is returned.
   */
  nullValue: Readonly<Ref<any, any>>

  /**
   * Whether any of the element's validations (across all languages) are
   * currently invalid, including children.
   */
  invalid: ComputedRef<boolean>

  required: ComputedRef<boolean>

  /**
   * Whether the current model value differs from the initial model value.
   */
  dirty: ComputedRef<boolean>

  /**
   * Whether any of the element's validations are currently pending an async
   * check, including children.
   */
  pending: ComputedRef<boolean>

  /**
   * Whether any of the element's validations are currently debouncing,
   * including children.
   */
  debouncing: ComputedRef<boolean>

  /**
   * Whether the element is busy, meaning it is either debouncing or has pending
   * async validation.
   */
  busy: ComputedRef<boolean>

  /**
   * Whether all of the element's validations (across all languages) have been
   * executed, including children.
   */
  validated: ComputedRef<boolean>

  /**
   * Whether the element is completed, meaning it either has no rules or has
   * been validated without errors.
   */
  completed: ComputedRef<boolean>

  success: ComputedRef<boolean>

  /**
   * Whether the element's current value is empty. Container elements check
   * whether all children are empty.
   */
  empty: ComputedRef<boolean>

  /**
   * Whether this element pushes its errors to its nearest ancestor element
   * instead of displaying and reporting them itself.
   */
  hoisted: ComputedRef<boolean | undefined>

  /**
   * All error messages for this element: its own plus any pushed up by hoisted
   * children.
   */
  errors: ComputedRef<any[]>

  /**
   * Whether the element has any active error messages.
   */
  hasError: ComputedRef<boolean>

  /**
   * The error messages rendered for this element. Empty when the element pushes
   * its errors to its parent; otherwise errors capped by `maxErrors`.
   */
  displayErrors: ComputedRef<any[]>

  /**
   * The element's own error messages (validation rules plus custom message bag
   * entries).
   */
  ownErrors: ComputedRef<string[]>

  /**
   * Error messages propagated to the form, keyed by element path. Empty when
   * the element pushes its errors to its parent.
   */
  formErrors: ComputedRef<Record<string, string[]>>

  /**
   * The list of custom messages from the message bag, including messages from
   * hoisted children.
   */
  messages: ComputedRef<string[]>

  /**
   * The element's message bag for custom errors and messages.
   */
  messageBag: MessageBagInstance

  /**
   * Resolved rule-specific validation messages, keyed by rule name.
   */
  ruleMessages: Record<string, ComputedRef<string | undefined>>
}
```
