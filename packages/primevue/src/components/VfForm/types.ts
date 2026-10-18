import type {
  Pager,
  PartOf,
  ClassValue,
  DomAttrsOf,
  TProp,
  ResolvedLanguagesProp,
  ResolvedPage,
  DefineElementContext,
  DefineRegistryEntry,
  WidenProps,
  FormSchema,
  ResolvedSchema,
  EntrySchemaOf,
  SlotPropsOf,
} from '@vueform/core'
import type { StepperProps, TabListProps, TabProps } from 'primevue'
import type { StepProps } from 'primevue/step'
import type { StepListProps } from 'primevue/steplist'
import type { StepPanelsProps } from 'primevue/steppanels'
import type { TabPanelsProps } from 'primevue/tabpanels'
import type { VNode } from 'vue'

import type {
  FormApi,
  FormProps,
  FormEmits,
  FormParts,
  FormSlots,
  FormA11y,
  FormExpose,
  FormClasses,
  FormModifiers,
} from '#src/blueprints/form'
import type { NavPosProp } from '#src/blueprints/nav'

/**
 * VfForm props narrowed from a registry `TEntry` payload, applying the entry's
 * `schema` prop (unwrapping a possible `Ref`) as the `TSchema` generic.
 */
export type EntryProps<TEntry> = VfFormProps<EntrySchemaOf<TEntry>>

/**
 * Props for the VfForm component, optionally parameterized by a concrete schema
 * type (e.g. `VfFormProps<typeof schema>` with a `defineSchema` result).
 * `TSchema` drives the typed schema API on the form context (`find` / `get` /
 * `set` / `model` / `payload` / `update`). Reach for `VfFormProps` instead when
 * no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfFormProps<TSchema = FormSchema> extends FormProps<
  VfFormSlots<TSchema>,
  VfFormParts,
  VfFormClasses,
  VfFormContext<VfFormProps<TSchema>>,
  TSchema
> {}

/**
 * Events emitted by the VfForm component, parameterized by the schema type so
 * event handlers (e.g. `@submit`) receive the schema-narrowed context — same
 * pattern as element emits. Plain usage (`VfFormEmits`) keeps the context
 * wide.
 */
export interface VfFormEmits<TSchema = FormSchema> extends FormEmits<
  VfFormContext<VfFormProps<TSchema>>
> {}

/**
 * Slots available in the VfForm component, parameterized by the schema type so
 * context-receiving slots (e.g. `#content`) get the schema-narrowed context.
 * Plain usage (`VfFormSlots`) keeps the context wide.
 */
export interface VfFormSlots<TSchema = FormSchema> extends FormSlots<
  VfFormContext<VfFormProps<TSchema>>
> {
  /**
   * Slot that replaces the entire form content area.
   *
   * @exposes VfForm
   */
  content: (scope: { context: VfFormContext<VfFormProps<TSchema>> }) => VNode[]

  /**
   * Slot that replaces the form-level errors <ul> container.
   */
  errors: (scope: {
    /**
     * The error messages keyed by element path.
     */
    errors: Record<string, string[]>

    /**
     * The errors container's element id.
     */
    id: string
  }) => VNode[]

  /**
   * Slot that replaces each individual error message inside <li>.
   */
  error: (scope: {
    /**
     * The error message.
     */
    error: string

    /**
     * The element path the error belongs to.
     */
    path: string
  }) => VNode[]

  /**
   * Slot that replaces the form-level messages <ul> container.
   */
  messages: (scope: {
    /**
     * The list of info messages.
     */
    messages?: string[]

    /**
     * The messages container's element id.
     */
    id: string
  }) => VNode[]

  /**
   * Slot that replaces each individual message inside <li>.
   */
  message: (scope: {
    /**
     * The info message.
     */
    message: string
  }) => VNode[]

  /**
   * Slot that replaces the language navigation bar. Receives the available
   * languages and the current selection.
   */
  languages: (scope: {
    /**
     * The available languages.
     */
    languages: ResolvedLanguagesProp

    /**
     * The currently selected language.
     */
    language: string

    /**
     * The set of languages containing validation errors.
     */
    invalidLanguages: Set<string>
  }) => VNode[]

  /**
   * Slot that replaces the tabs navigation bar. Receives the pager instance.
   */
  tabs: (scope: {
    /**
     * The pager instance controlling the tabs.
     */
    pager: Pager
  }) => VNode[]

  /**
   * Slot that replaces each individual tab.
   */
  tab: (scope: {
    /**
     * The resolved page of the tab.
     */
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces the steps navigation bar. Receives the pager instance.
   */
  steps: (scope: {
    /**
     * The pager instance controlling the steps.
     */
    pager: Pager
  }) => VNode[]

  /**
   * Slot that replaces each individual step.
   */
  step: (scope: {
    /**
     * The resolved page of the step.
     */
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces the form elements area. Receives the resolved schema.
   */
  elements: (scope: {
    /**
     * The resolved form schema.
     */
    resolvedSchema: ResolvedSchema

    /**
     * The pager instance when the form is paged.
     */
    pager?: Pager
  }) => VNode[]

  /**
   * Slot that replaces the navigation bar. Receives pager, button labels, and
   * visibility.
   */
  nav: (scope: {
    /**
     * The pager instance controlling navigation.
     */
    pager: Pager

    /**
     * The label of the next button.
     */
    nextLabel?: TProp

    /**
     * The label of the back button.
     */
    backLabel?: TProp

    /**
     * The label of the finish button.
     */
    finishLabel?: TProp

    /**
     * Whether the back button is displayed.
     */
    showBack: boolean

    /**
     * The position of the navigation bar.
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

  /**
   * Slot for the default form body content. Receives the resolved schema.
   */
  default: (scope: {
    /**
     * The resolved form schema.
     */
    resolvedSchema: ResolvedSchema
  }) => VNode[]
}

/**
 * Structural parts of the VfForm component.
 */
export interface VfFormParts extends FormParts {
  /**
   * The root form element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * Props forwarded to the nested TabList component.
   *
   * @tag TabList
   */
  tabsContainer: TabListProps

  /**
   * Props forwarded to the nested Stepper component.
   */
  stepsContainer: StepperProps

  /**
   * The errors container element.
   *
   * @tag div
   */
  errorsWrapper: DomAttrsOf<'div'>

  /**
   * The error list element.
   *
   * @tag ul
   */
  errors: DomAttrsOf<'ul'>

  /**
   * Each error item element.
   *
   * @tag li
   */
  error: DomAttrsOf<'li'>

  /**
   * The messages container element.
   *
   * @tag div
   */
  messagesWrapper: DomAttrsOf<'div'>

  /**
   * The message list element.
   *
   * @tag ul
   */
  messages: DomAttrsOf<'ul'>

  /**
   * Each message item element.
   *
   * @tag li
   */
  message: DomAttrsOf<'li'>

  /**
   * Props forwarded to the nested TabList component.
   *
   * @tag VfSelectButton
   */
  languages: PartOf<'VfSelectButton'>

  /**
   * Props forwarded to the nested TabList component.
   */
  tabs: TabListProps

  /**
   * Props forwarded to each nested Tab component.
   *
   * @param page The tab’s resolved page.
   * @tag Tab
   */
  tab: (page: ResolvedPage) => TabProps

  /**
   * Props forwarded to the nested VfSteps component.
   *
   * @tag StepList
   */
  steps: StepListProps

  /**
   * Props forwarded to each nested Step component.
   *
   * @param page The step’s resolved page.
   */
  step: (page: ResolvedPage) => StepProps

  /**
   * The inner wrapper element of each step.
   *
   * @param page The step’s resolved page.
   */
  stepInner: (page: ResolvedPage) => DomAttrsOf<'div'>

  /**
   * The clickable header button of each step.
   *
   * @param page The step’s resolved page.
   */
  stepHeader: (page: ResolvedPage) => DomAttrsOf<'button'>

  /**
   * The number indicator element of each step.
   *
   * @param page The step’s resolved page.
   */
  stepNumber: (page: ResolvedPage) => DomAttrsOf<'span'>

  /**
   * The icon element of each step, shown in place of the number.
   *
   * @param page The step’s resolved page.
   */
  stepIcon: (page: ResolvedPage) => DomAttrsOf<'i'>

  /**
   * The title element of each step.
   *
   * @param page The step’s resolved page.
   */
  stepTitle: (page: ResolvedPage) => DomAttrsOf<'span'>

  /**
   * Props forwarded to each nested StepItem component in vertical mode.
   *
   * @param page The step’s resolved page.
   */
  stepItem: (page: ResolvedPage) => StepProps

  /**
   * Props forwarded to each nested StepPanel component in vertical mode.
   *
   * @param page The step’s resolved page.
   */
  stepPanel: (page: ResolvedPage) => StepProps

  /**
   * Props forwarded to the nested VfNav component.
   *
   * @tag VfNav
   */
  nav: PartOf<'VfNav'>

  /**
   * Props forwarded to the nested VfElements component.
   *
   * @tag VfElements
   */
  elements: PartOf<'VfElements'>

  /**
   * Props forwarded to the nested TabPanels component.
   */
  tabPanels: TabPanelsProps

  /**
   * Props forwarded to the nested StepPanels component.
   */
  stepPanels: StepPanelsProps
}

/**
 * CSS classes for the VfForm component's structural parts.
 */
export interface VfFormClasses extends FormClasses {
  /**
   * The root form element.
   */
  root: ClassValue

  /**
   * The tabs container element.
   */
  tabsContainer: ClassValue

  /**
   * The steps container element.
   */
  stepsContainer: ClassValue

  /**
   * The errors container element.
   */
  errorsWrapper: ClassValue

  /**
   * The error list element.
   */
  errors: ClassValue

  /**
   * Each error item element.
   */
  error: ClassValue

  /**
   * The messages container element.
   */
  messagesWrapper: ClassValue

  /**
   * The message list element.
   */
  messages: ClassValue

  /**
   * Each message item element.
   */
  message: ClassValue

  /**
   * The language selector element.
   */
  languages: ClassValue

  /**
   * The tab list element.
   */
  tabs: ClassValue

  /**
   * Each individual tab element.
   *
   * @param page The tab’s resolved page.
   */
  tab: (page: ResolvedPage) => ClassValue

  /**
   * The step list element.
   */
  steps: ClassValue

  /**
   * Each individual step element.
   *
   * @param page The step’s resolved page.
   */
  step: (page: ResolvedPage) => ClassValue

  /**
   * The inner wrapper element of each step.
   *
   * @param page The step’s resolved page.
   */
  stepInner: (page: ResolvedPage) => ClassValue

  /**
   * The clickable header button of each step.
   *
   * @param page The step’s resolved page.
   */
  stepHeader: (page: ResolvedPage) => ClassValue

  /**
   * The number indicator element of each step.
   *
   * @param page The step’s resolved page.
   */
  stepNumber: (page: ResolvedPage) => ClassValue

  /**
   * The icon element of each step, shown in place of the number.
   *
   * @param page The step’s resolved page.
   */
  stepIcon: (page: ResolvedPage) => ClassValue

  /**
   * The title element of each step.
   *
   * @param page The step’s resolved page.
   */
  stepTitle: (page: ResolvedPage) => ClassValue

  /**
   * Each step item element in vertical mode.
   *
   * @param page The step’s resolved page.
   */
  stepItem: (page: ResolvedPage) => ClassValue

  /**
   * Each step panel element in vertical mode.
   *
   * @param page The step’s resolved page.
   */
  stepPanel: (page: ResolvedPage) => ClassValue

  /**
   * The navigation bar element.
   */
  nav: ClassValue

  /**
   * The form elements container element.
   */
  elements: ClassValue

  /**
   * The tab panels container element.
   */
  tabPanels: ClassValue

  /**
   * The step panels container element.
   */
  stepPanels: ClassValue
}

/**
 * Accessibility bindings of the VfForm component.
 */
export interface VfFormA11y extends FormA11y {}

/**
 * Styling modifiers of the VfForm component.
 */
export interface VfFormModifiers extends FormModifiers {
  /**
   * The root form element's stacked layout marker.
   */
  root: {
    'data-stacked'?: ''
  }
}

/**
 * Augmentable public API surface for VfForm.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `FormExpose` for all form-based components) so they
 * appear on `ContextOf<'VfForm'>` / `context$` / `defineExpose`.
 */
export interface VfFormExpose extends FormExpose {}

/**
 * Public context for VfForm, optionally parameterized by concrete props (e.g.
 * `VfFormContext<VfFormProps<typeof schema>>`) so the schema API slice (`find`
 * / `get` / `set` / `model` / `payload` / `update`) narrows to the schema
 * carried by the `schema` prop.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfFormContext<
  // `any` in the schema slot: `MaybeRef<TSchema>` is invariant through `Ref`,
  // so a `FormSchema`-typed constraint would reject every concrete schema.
  TProps extends WidenProps<
    VfFormProps,
    FormProps<FormSlots, FormParts, FormClasses, any, any>
  > = VfFormProps,
> extends DefineElementContext<
  TProps,
  VfFormEmits,
  VfFormSlots,
  VfFormParts,
  VfFormClasses,
  VfFormModifiers,
  VfFormA11y,
  VfFormExpose,
  FormApi<TProps>
> {}

/**
 * Registry entry for VfForm. `TEntry` narrows the schema API slice of the
 * context by the entry's `schema` prop, the same way the SFC generic does.
 */
export interface VfFormEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfFormEmits<EntrySchemaOf<TEntry>>,
  VfFormSlots,
  VfFormParts,
  VfFormClasses,
  VfFormContext<EntryProps<TEntry>>
> {}
