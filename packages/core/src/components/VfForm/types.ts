import type { VNode } from 'vue'

import type {
  FormApi,
  FormProps,
  FormEmits,
  FormParts,
  FormSlots,
  FormExpose,
  FormClasses,
} from '#src/blueprints/form'
import type { NavPosProp } from '#src/blueprints/nav'
import type { Pager } from '#src/composables'
import type { TabbedSlots } from '#src/features'
import {
  type DefineElementContext,
  type DefineRegistryEntry,
  type WidenProps,
  type FormSchema,
  type LanguagesProp,
  type PartOf,
  type SlotPropsOf,
  type ClassValue,
  type DomAttrsOf,
  type TProp,
  type ResolvedSchema,
  type EntrySchemaOf,
} from '#src/types'

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
export interface VfFormSlots<TSchema = FormSchema>
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
   * Props forwarded to the nested VfLanguages component.
   *
   * @tag VfLanguages
   */
  languages: PartOf<'VfLanguages'>

  /**
   * Props forwarded to the nested VfTabs component.
   *
   * @tag VfTabs
   */
  tabs: PartOf<'VfTabs'>

  /**
   * Props forwarded to the nested VfSteps component.
   *
   * @tag VfSteps
   */
  steps: PartOf<'VfSteps'>

  /**
   * Props forwarded to the nested VfElements component.
   *
   * @tag VfElements
   */
  elements: PartOf<'VfElements'>

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
   * Props forwarded to the nested VfNav component.
   *
   * @tag VfNav
   */
  nav: PartOf<'VfNav'>
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
