```ts
/**
 * Manages element-level data, validation state, error handling, and lifecycle
 * for all stateful form elements — leaf inputs, containers, and the form root.
 *
 * Behavior is configured via options:
 *
 * - `nested` activates children aggregation (groups, lists, grids, matrices)
 * - `flat` skips data path registration and payload wrapping
 * - `items` enables dynamic list operations (add/remove/sort)
 * - `translatable` enables per-language validation
 * - `root` designates the form root
 *
 * @param options Element data configuration object.
 */
function useData(options: UseDataOptions): {
  validation: ShallowReactive<Record<string, ValidationView>>
  currentValidation: Readonly<Ref<ValidationView, ValidationView>>
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
   * context. For flat containers this is the parent's model — children's data
   * lives merged at the parent level, while the public `model` is a scoped
   * projection. For every other element it is the element's own `model`.
   */
  containerModel: ComputedRef<unknown>

  /**
   * Updates the element's model value. For isContainer.value containers,
   * performs a deep merge. For leaf elements, sets the value directly and
   * invalidates validation.
   *
   * @param data The new value or data to merge.
   */
  update: (data: any) => void

  /**
   * Handles a native input event and updates the model from the event target.
   * Text and select inputs use `target.value`. Checkboxes and radios use the
   * `checked` state with `trueValue` / `falseValue` when available.
   *
   * @param data The native DOM event from the input.
   */
  handleModelUpdate: (data: Event) => void

  /**
   * Resets the element to its initial model state and fires the `reset` event.
   * For isContainer.value containers, delegates to children or resets the model
   * directly for dynamic lists.
   */
  reset: () => void

  /**
   * Clears the element to its null value and fires the `clear` event. For
   * isContainer.value containers, delegates to children or clears the model for
   * dynamic lists.
   */
  clear: () => void

  /**
   * Loads data into the element and fires the `load` event, cascading to all
   * children so expression tracking can be stopped per-element.
   *
   * @param data The new value or data to load.
   */
  load: (data: any) => void

  /**
   * Runs validation on the element's own rules and all children, returning
   * whether everything is valid. Elements already validated without errors
   * against their current value are skipped unless `force: true` re-runs
   * everything — for rules whose outcome can change without the value changing
   * (async server checks, date boundaries).
   *
   * @param options Pass `force: true` to re-validate every element, ignoring
   *   current results.
   */
  validate: (options?: { force?: boolean }) => Promise<boolean>

  validateSelf: () => Promise<boolean>

  /**
   * Validates stateful children, returning whether all are valid. By default
   * only incomplete children run — never-validated, stale, or invalid ones;
   * children validated without errors against their current value keep their
   * result. `force: true` runs every child regardless of prior results.
   *
   * @param options Pass `force: true` to re-validate all children, ignoring
   *   current results.
   */
  validateChildren: (options?: { force?: boolean }) => Promise<boolean>

  validateCurrent: () => Promise<boolean>

  /**
   * Resets all validation state. For isContainer.value containers, also
   * delegates to children.
   */
  unvalidate: () => void

  /**
   * Marks all validation instances as invalidated, requiring revalidation. For
   * isContainer.value containers, also delegates to children.
   */
  invalidate: () => void

  /**
   * Marks the element as clean by updating the initial model snapshot. For
   * isContainer.value containers, delegates to children.
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
   * The stable ids move in lockstep with the model, so the item's component
   * instance follows it: its validation state and message bag (stored on the
   * instance) travel automatically. No snapshot/restore of per-child state is
   * needed — the child re-points to its new slot via a non-destructive
   * re-path.
   *
   * @param fromIndex The source data index of the item to move.
   * @param toIndex The destination data index for the item.
   */
  sort: (fromIndex: number, toIndex: number) => Promise<void>

  /**
   * Checks whether a value is considered filled. For isContainer.value
   * containers, delegates to children. For leaf elements, checks the scalar
   * value.
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
   * The index of the item currently being dragged in a sortable list. This is a
   * data index (position in the canonical order), so it stays stable during a
   * drag preview and only the display order changes.
   */
  dragIndex: Ref<any, any>

  /**
   * The data index where the dragged item will be dropped.
   */
  dropIndex: Ref<any, any>

  /**
   * The resolved, display-ordered items for dynamic container elements. Each
   * entry pairs the stable item `id` (the `v-for` key) with its canonical
   * `index` (its position in the data model). Only created when `rows` is
   * passed.
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
   * The root model backing the form when this element operates as the form root
   * (adopting a `useModel` instance from `modelValue` or creating an internal
   * store), `undefined` for every other element.
   */
  rootModel: RootModel | undefined

  /**
   * The element's submission payload. For isContainer.value containers,
   * aggregates from children. For leaf elements, returns own value.
   */
  payload: ComputedRef<Record<ElementName, any>>

  /**
   * The dot-notation path to this element's value within the form data object
   * (e.g. `"address.city"`). Empty string for the root model. Flat containers
   * inherit their parent's data path.
   */
  dataPath: Readonly<Ref<string, string>>

  /**
   * The root data paths of the model subtree this element's data occupies: its
   * own `dataPath`, or — for flat containers, whose data lives merged at the
   * parent level — each child's subtree paths.
   */
  ownDataPaths: ComputedRef<string[]>

  /**
   * Data paths holding sensitive data (`sensitive: true`) within this element's
   * subtree — excluded from locally stored autosave drafts. A sensitive element
   * marks its whole subtree; containers otherwise aggregate from children.
   * Unavailable elements are included: their data may still linger in the
   * model, and stripping an absent path is harmless.
   */
  sensitivePaths: ComputedRef<string[]>

  /**
   * The value the element holds when it is considered empty. Determined by
   * `nullValue` / `falseValue` props, element type (container, multiple), and
   * translatable state. For translatable elements a per-language object is
   * returned.
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
   * Whether the element's current value is empty. For isContainer.value
   * containers, checks whether all children are empty. For leaf elements,
   * checks whether the value is blank or equals the falseValue.
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
   * The element's own error messages across all languages (validation rules
   * plus custom message bag entries).
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
   * The element's message bag for managing custom errors, messages, and
   * prepended/appended messages.
   */
  messageBag: MessageBagInstance

  /**
   * Resolved rule-specific validation messages, keyed by rule name.
   */
  ruleMessages: Record<string, ComputedRef<string | undefined>>
}
```
