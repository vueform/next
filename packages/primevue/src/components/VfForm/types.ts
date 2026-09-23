import type {
  FormApi,
  FormProps,
  FormEmits,
  FormParts,
  FormSlots,
  FormExpose,
  FormClasses,
} from '@/blueprints/form'
import type { NavPosProp } from '@/blueprints/nav'
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
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
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
  content: (props: { context: VfFormContext<VfFormProps<TSchema>> }) => VNode[]

  /**
   * Slot that replaces the form-level errors <ul> container.
   */
  errors: (props: { errors: Record<string, string[]>; id: string }) => VNode[]

  /**
   * Slot that replaces each individual error message inside <li>.
   */
  error: (props: { error: string; path: string }) => VNode[]

  /**
   * Slot that replaces the form-level messages <ul> container.
   */
  messages: (props: { messages?: string[]; id: string }) => VNode[]

  /**
   * Slot that replaces each individual message inside <li>.
   */
  message: (props: { message: string }) => VNode[]

  /**
   * Slot that replaces the language navigation bar. Receives the available
   * languages and the current selection.
   */
  languages: (props: {
    languages: ResolvedLanguagesProp
    language: string
    invalidLanguages: Set<string>
  }) => VNode[]

  /**
   * Slot that replaces the tabs navigation bar. Receives the pager instance.
   */
  tabs: (props: { pager: Pager }) => VNode[]

  /**
   * Slot that replaces each individual tab.
   */
  tab: (props: { page: ResolvedPage }) => VNode[]

  /**
   * Slot that replaces the steps navigation bar. Receives the pager instance.
   */
  steps: (props: { pager: Pager }) => VNode[]

  /**
   * @write
   */
  step: (props: { page: ResolvedPage }) => VNode[]

  /**
   * Slot that replaces the form elements area. Receives the resolved schema.
   */
  elements: (props: {
    resolvedSchema: ResolvedSchema
    pager?: Pager
  }) => VNode[]

  /**
   * Slot that replaces the navigation bar. Receives pager, button labels, and
   * visibility.
   */
  nav: (props: {
    pager: Pager
    nextLabel?: TProp
    backLabel?: TProp
    finishLabel?: TProp
    showBack: boolean
    position?: NavPosProp
  }) => VNode[]

  /**
   * Slot that replaces the back button in the navigation bar.
   *
   * @inherits VfNav.back
   */
  back: (props: SlotPropsOf<'VfNav', 'back'>) => VNode[]

  /**
   * Slot that replaces the back button's text label.
   *
   * @inherits VfNav.backText
   */
  backText: (props: SlotPropsOf<'VfNav', 'backText'>) => VNode[]

  /**
   * Slot that replaces the next button in the navigation bar.
   *
   * @inherits VfNav.next
   */
  next: (props: SlotPropsOf<'VfNav', 'next'>) => VNode[]

  /**
   * Slot that replaces the next button's text label.
   *
   * @inherits VfNav.nextText
   */
  nextText: (props: SlotPropsOf<'VfNav', 'nextText'>) => VNode[]

  /**
   * Slot that replaces the finish button in the navigation bar.
   *
   * @inherits VfNav.finish
   */
  finish: (props: SlotPropsOf<'VfNav', 'finish'>) => VNode[]

  /**
   * Slot that replaces the finish button's text label.
   *
   * @inherits VfNav.finishText
   */
  finishText: (props: SlotPropsOf<'VfNav', 'finishText'>) => VNode[]

  /**
   * Slot for the default form body content. Receives the resolved schema.
   */
  default: (props: { resolvedSchema: ResolvedSchema }) => VNode[]
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
   * @write
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
   * @write
   */
  tabs: TabListProps

  /**
   * @write
   *
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
   * @write
   */
  step: (page: ResolvedPage) => StepProps

  /**
   * @write
   */
  stepInner: (page: ResolvedPage) => DomAttrsOf<'div'>

  /**
   * @write
   */
  stepHeader: (page: ResolvedPage) => DomAttrsOf<'button'>

  /**
   * @write
   */
  stepNumber: (page: ResolvedPage) => DomAttrsOf<'span'>

  /**
   * @write
   */
  stepIcon: (page: ResolvedPage) => DomAttrsOf<'i'>

  /**
   * @write
   */
  stepTitle: (page: ResolvedPage) => DomAttrsOf<'span'>

  /**
   * @write
   */
  stepItem: (page: ResolvedPage) => StepProps

  /**
   * @write
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
   * @write
   */
  tabPanels: TabPanelsProps

  /**
   * @write
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
   * @write
   */
  tabsContainer: ClassValue

  /**
   * @write
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
   * @write
   */
  languages: ClassValue

  /**
   * @write
   */
  tabs: ClassValue

  /**
   * @write
   */
  tab: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  steps: ClassValue

  /**
   * @write
   */
  step: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  stepInner: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  stepHeader: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  stepNumber: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  stepIcon: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  stepTitle: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  stepItem: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  stepPanel: (page: ResolvedPage) => ClassValue

  /**
   * @write
   */
  nav: ClassValue

  /**
   * @write
   */
  elements: ClassValue

  /**
   * @write
   */
  tabPanels: ClassValue

  /**
   * @write
   */
  stepPanels: ClassValue
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
