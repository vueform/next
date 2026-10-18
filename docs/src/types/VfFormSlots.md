```ts
/**
 * Slots available in the VfForm component, parameterized by the schema type so
 * context-receiving slots (e.g. `#content`) get the schema-narrowed context.
 * Plain usage (`VfFormSlots`) keeps the context wide.
 */
interface VfFormSlots<TSchema = FormSchema>
  extends FormSlots<VfFormContext<VfFormProps<TSchema>>>, TabbedSlots {
  /**
   * Slot that replaces the entire form content area. Receives the form's
   * context as a single `context` prop, like the `template` slot.
   *
   * @param scope The content slot's params.
   * @context
   */
  content: (scope: {
    /**
     * The component's context.
     */
    context: VfFormContext<VfFormProps<TSchema>>
  }) => VNode[]

  /**
   * Slot that replaces the language selector. Receives available languages and
   * select handler.
   */
  languages: (scope: {
    /**
     * Language codes that currently have validation errors.
     */
    invalidLanguages: Set<string>

    /**
     * The available languages.
     */
    languages: LanguagesProp

    /**
     * The currently selected language code.
     */
    language: string

    /**
     * Handler to select a language.
     *
     * @param language The language code to select.
     */
    select: (language: string) => void
  }) => VNode[]

  /**
   * Slot that replaces each individual language option.
   *
   * @inherits VfLanguages.default
   */
  language: (scope: SlotPropsOf<'VfLanguages', 'default'>) => VNode[]

  /**
   * Slot that replaces the steps navigation bar. Receives the pager instance.
   */
  steps: (scope: {
    /**
     * The pager instance managing step state.
     */
    pager: Pager
  }) => VNode[]

  /**
   * Slot that replaces each individual step indicator.
   *
   * @inherits VfSteps.default
   */
  step: (scope: SlotPropsOf<'VfSteps', 'default'>) => VNode[]

  /**
   * Slot that replaces the tabs navigation bar. Receives the pager instance.
   */
  tabs: (scope: {
    /**
     * The pager instance managing tab state.
     */
    pager: Pager
  }) => VNode[]

  /**
   * Slot that replaces each individual tab.
   *
   * @inherits VfTabs.default
   */
  tab: (scope: SlotPropsOf<'VfTabs', 'default'>) => VNode[]

  /**
   * Slot that replaces the form-level errors container.
   */
  errors: (scope: {
    /**
     * The form errors keyed by element path.
     */
    errors: Record<string, string[]>

    /**
     * The errors container's element id.
     */
    id: string

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfFormClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfFormParts>

    /**
     * The form's part-keyed accessibility bindings; apply the `errors` bag
     * (id, alert role, live region attributes) to the replacement container
     * with `v-bind` so error announcements keep working.
     */
    a11yBindings: VfFormA11y
  }) => VNode[]

  /**
   * Slot that replaces each individual error message.
   */
  error: (scope: {
    /**
     * The error message text.
     */
    error: string

    /**
     * The element path the error belongs to.
     */
    path: string
  }) => VNode[]

  /**
   * Slot that replaces the form-level messages container.
   */
  messages: (scope: {
    /**
     * The form-level message texts.
     */
    messages?: string[]

    /**
     * The messages container's element id.
     */
    id: string

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfFormClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfFormParts>

    /**
     * The form's part-keyed accessibility bindings; apply the `messages` bag
     * (id, status role, live region attributes) to the replacement container
     * with `v-bind` so message announcements keep working.
     */
    a11yBindings: VfFormA11y
  }) => VNode[]

  /**
   * Slot that replaces each individual message.
   */
  message: (scope: {
    /**
     * The message text.
     */
    message: string
  }) => VNode[]

  /**
   * Slot that replaces the form elements area. Receives the resolved schema.
   */
  elements: (scope: {
    /**
     * The form's resolved schema.
     */
    resolvedSchema: ResolvedSchema
  }) => VNode[]

  /**
   * Slot for the default form body content. Receives the resolved schema.
   */
  default: (scope: {
    /**
     * The form's resolved schema.
     */
    resolvedSchema: ResolvedSchema
  }) => VNode[]

  /**
   * Slot that replaces the navigation bar. Receives pager, button labels, and
   * visibility.
   */
  nav: (scope: {
    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The next button's label text.
     */
    next?: TProp

    /**
     * The back button's label text.
     */
    back?: TProp

    /**
     * The finish button's label text.
     */
    finish?: TProp

    /**
     * Whether the back button is hidden.
     */
    hideBack?: boolean

    /**
     * The nav position.
     */
    position?: NavPosProp
  }) => VNode[]

  /**
   * Slot that replaces the back button in the navigation bar.
   *
   * @inherits VfNav.back
   */
  back: (scope: SlotPropsOf<'VfNav', 'back'>) => VNode[]

  /**
   * Slot that replaces the back button's text label.
   *
   * @inherits VfNav.backText
   */
  backText: (scope: SlotPropsOf<'VfNav', 'backText'>) => VNode[]

  /**
   * Slot that replaces the next button in the navigation bar.
   *
   * @inherits VfNav.next
   */
  next: (scope: SlotPropsOf<'VfNav', 'next'>) => VNode[]

  /**
   * Slot that replaces the next button's text label.
   *
   * @inherits VfNav.nextText
   */
  nextText: (scope: SlotPropsOf<'VfNav', 'nextText'>) => VNode[]

  /**
   * Slot that replaces the finish button in the navigation bar.
   *
   * @inherits VfNav.finish
   */
  finish: (scope: SlotPropsOf<'VfNav', 'finish'>) => VNode[]

  /**
   * Slot that replaces the finish button's text label.
   *
   * @inherits VfNav.finishText
   */
  finishText: (scope: SlotPropsOf<'VfNav', 'finishText'>) => VNode[]
}
```
