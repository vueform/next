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
   * @param props.context The component's context.
   * @context
   */
  content: (props: { context: VfFormContext<VfFormProps<TSchema>> }) => VNode[]

  /**
   * Slot that replaces the language selector. Receives available languages and
   * select handler.
   */
  languages: (props: {
    invalidLanguages: Set<string>
    languages: LanguagesProp
    language: string
    select: (language: string) => void
  }) => VNode[]

  /**
   * Slot that replaces each individual language option.
   *
   * @inherits VfLanguages.default
   */
  language: (props: SlotProps['VfLanguages']['default']) => VNode[]

  /**
   * Slot that replaces the steps navigation bar. Receives the pager instance.
   */
  steps: (props: { pager: Pager }) => VNode[]

  /**
   * Slot that replaces each individual step indicator.
   *
   * @inherits VfSteps.default
   */
  step: (props: SlotProps['VfSteps']['default']) => VNode[]

  /**
   * Slot that replaces the tabs navigation bar. Receives the pager instance.
   */
  tabs: (props: { pager: Pager }) => VNode[]

  /**
   * Slot that replaces each individual tab.
   *
   * @inherits VfTabs.default
   */
  tab: (props: SlotProps['VfTabs']['default']) => VNode[]

  /**
   * Slot that replaces the form-level errors container.
   */
  errors: (props: { errors: Record<string, string[]>; id: string }) => VNode[]

  /**
   * Slot that replaces each individual error message.
   */
  error: (props: { error: string; path: string }) => VNode[]

  /**
   * Slot that replaces the form-level messages container.
   */
  messages: (props: { messages?: string[]; id: string }) => VNode[]

  /**
   * Slot that replaces each individual message.
   */
  message: (props: { message: string }) => VNode[]

  /**
   * Slot that replaces the form elements area. Receives the resolved schema.
   */
  elements: (props: { resolvedSchema: ResolvedSchema }) => VNode[]

  /**
   * Slot for the default form body content. Receives the resolved schema.
   */
  default: (props: { resolvedSchema: ResolvedSchema }) => VNode[]

  /**
   * Slot that replaces the navigation bar. Receives pager, button labels, and
   * visibility.
   */
  nav: (props: {
    pager: Pager
    next?: TProp
    back?: TProp
    finish?: TProp
    hideBack?: boolean
    position?: NavPosProp
  }) => VNode[]

  /**
   * Slot that replaces the back button in the navigation bar.
   *
   * @inherits VfNav.back
   */
  back: (props: SlotProps['VfNav']['back']) => VNode[]

  /**
   * Slot that replaces the back button's text label.
   *
   * @inherits VfNav.backText
   */
  backText: (props: SlotProps['VfNav']['backText']) => VNode[]

  /**
   * Slot that replaces the next button in the navigation bar.
   *
   * @inherits VfNav.next
   */
  next: (props: SlotProps['VfNav']['next']) => VNode[]

  /**
   * Slot that replaces the next button's text label.
   *
   * @inherits VfNav.nextText
   */
  nextText: (props: SlotProps['VfNav']['nextText']) => VNode[]

  /**
   * Slot that replaces the finish button in the navigation bar.
   *
   * @inherits VfNav.finish
   */
  finish: (props: SlotProps['VfNav']['finish']) => VNode[]

  /**
   * Slot that replaces the finish button's text label.
   *
   * @inherits VfNav.finishText
   */
  finishText: (props: SlotProps['VfNav']['finishText']) => VNode[]
}
```
