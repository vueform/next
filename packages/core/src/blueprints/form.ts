// @flag review later
import {
  computed,
  nextTick,
  onMounted,
  ref,
  toRef,
  unref,
  type ComputedRef,
  type MaybeRef,
  type Ref,
} from 'vue'

import type { NavPosProp } from '#src/blueprints/nav'
import {
  useAutosave,
  useChildren,
  useConfig,
  useCurrentElement,
  usePager,
  useSchema,
  useDynamicProp,
  useData,
  type Pager,
  type ResolvedPage,
  useExpression,
  useHttp,
  useLocale,
  useTokens,
} from '#src/composables'
import { createFormContext, createContainerContext } from '#src/contexts'
import type { StackedProps, TabbedEmits, TabbedProps } from '#src/features'
import {
  defineDefaults,
  getAttachedValidationSchema,
  type DefineEvents,
} from '#src/helpers'
import type { AutosaveProp } from '#src/modules/autosave'
import type {
  ConditionalProp,
  ConditionsTriggerProp,
} from '#src/modules/conditions'
import { getExpressionModule } from '#src/modules/expression'
import {
  HttpError,
  type HttpResponse,
  type RequestMethod,
} from '#src/modules/http'
import {
  getModelModule,
  type ModelInstance,
  type ModelNode,
} from '#src/modules/model'
import { getValidationModule, type Issue } from '#src/modules/validation'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentExpose,
  BaseComponentClasses,
  EndpointProp,
  ErrorLevelProp,
  ExpressionsProp,
  LanguagesProp,
  RuleMessagesProp,
  ScrollTopOnProp,
  ShowRequiredProp,
  TProp,
  ThemeTokens,
  ValidateOnProp,
  LooseRequired,
  FormSchema,
  DeepPartial,
  ElementByPath,
  GetResult,
  ModelByPath,
  Paths,
  SchemaToModel,
  StandardSchemaV1,
} from '#src/types'
import {
  get as getByPath,
  isPlainObject,
  rootDomOf,
  scrollIntoViewIfNeeded,
  warn,
  isDev,
} from '#src/utils'

/**
 * The non-generic bulk of the form factory API, computed and cached once at the
 * widest props. `FormApi<TProps>` overlays only the small schema-dependent
 * slice (`find` / `get` / `set` / model fields) on top — instantiating
 * `ReturnType<typeof blueprint<TProps>>` per concrete props re-derives the
 * entire blueprint return each time.
 */
type FormApiBase = Omit<ReturnType<typeof setup>, keyof FormSchemaApi>

/**
 * The schema type carried by a form props type's `schema` prop (`MaybeRef`
 * unwrapped), falling back to the wide `FormSchema`.
 */
type FormPropsSchema<TProps> = TProps extends {
  schema?: MaybeRef<(infer S) | undefined>
}
  ? [S] extends [never]
    ? FormSchema
    : S
  : FormSchema

/**
 * Props for the form component blueprint, optionally parameterized by a
 * concrete schema type (`TSchema`) that drives the typed schema API (`find` /
 * `get` / `set` / `model` / `payload` / `update`).
 */
export interface FormProps<
  S = FormSlots,
  P = FormParts,
  C = FormClasses,
  TContext = any,
  TSchema = FormSchema,
>
  extends BaseComponentProps<S, P, C, TContext>, TabbedProps, StackedProps {
  /**
   * Optional name identifying this form instance in DevTools and debugging.
   */
  name?: string

  /**
   * The schema defining the form's elements and structure.
   */
  schema?: MaybeRef<TSchema>

  /**
   * The form data object (v-model), or a `useModel` instance whose store the
   * form adopts (shared data, no cloning or v-model sync).
   */
  modelValue?: Record<string, any> | ModelInstance<any>

  /**
   * Custom validation error messages keyed by rule name.
   */
  ruleMessages?: RuleMessagesProp

  /**
   * Available languages for multilingual forms.
   */
  languages?: LanguagesProp

  /**
   * The default selected language.
   */
  language?: string

  /**
   * Whether the form supports multilingual content.
   */
  multilingual?: boolean

  /**
   * Events that trigger form validation (e.g. blur, change, submit).
   */
  validateOn?: ValidateOnProp

  /**
   * A Standard Schema (Zod, Valibot, ArkType, …) validated against the whole
   * form data for form-level (cross-field) validation. Issues are bucketed by
   * path onto the matching element's validation state; unmatched / pathless
   * issues surface as the form's root-level errors. Overrides a Standard Schema
   * attached via `defineSchema`'s second argument.
   */
  validationSchema?: StandardSchemaV1

  /**
   * Where to show required field indicators (e.g. label, placeholder).
   */
  showRequired?: ShowRequiredProp

  /**
   * Whether to clear custom/server errors on revalidation.
   */
  clearCustomErrors?: boolean

  /**
   * Controls where validation errors are displayed (element-level, form-level,
   * or both).
   */
  errorLevel?: ErrorLevelProp

  /**
   * Whether to hide form-level validation error messages.
   */
  hideErrors?: boolean

  /**
   * Whether the form uses a multi-step wizard layout.
   */
  stepped?: boolean

  /**
   * Whether to show a progress bar in stepped forms.
   */
  progress?: boolean

  /**
   * Whether to show step navigation in stepped forms.
   */
  nav?: boolean

  /**
   * @write
   */
  navPos?: NavPosProp

  /**
   * Whether to automatically sync step state when data is loaded or the form
   * mounts with pre-filled data. When enabled, steps are enabled up to the last
   * step that has data and that step is selected.
   */
  syncSteps?: boolean

  /**
   * Whether to enable browser history for stepped forms.
   */
  history?: boolean

  /**
   * Overrides the global `config.routerQueryParam` for this form. When set,
   * step names are encoded as a query parameter instead of a path segment.
   */
  routerQueryParam?: string

  /**
   * Whether to show the back button in stepped forms.
   */
  back?: boolean

  /**
   * The label for the next step button.
   */
  nextLabel?: TProp<string, TContext>

  /**
   * The label for the back step button.
   */
  backLabel?: TProp<string, TContext>

  /**
   * The label for the finish/submit button in stepped forms.
   */
  finishLabel?: TProp<string, TContext>

  /**
   * Events that trigger scrolling to the top of the form.
   */
  scrollTopOn?: ScrollTopOnProp

  /**
   * Whether to scroll to the first element with an error on validation failure.
   */
  scrollToError?: boolean

  /**
   * Options passed to `scrollIntoView` when scrolling.
   */
  scrollOptions?: ScrollIntoViewOptions

  /**
   * Whether to focus the first element with an error on validation failure.
   */
  focusError?: boolean

  /**
   * The autosave configuration object: a remote `endpoint` (URL or handler
   * function) with its scheduling options (`on`, `interval`, `delay`,
   * `invalid`, `method`, `transform`), and/or a `local` draft mirror that saves
   * the model to storage on every action, restores it on mount, and clears it
   * on successful submit.
   */
  autosave?: AutosaveProp

  /**
   * Whether the form should display a default submit button
   */
  submits?: boolean

  /**
   * Whether the form is in a loading state.
   */
  loading?: boolean

  /**
   * Whether the form is disabled. Accepts a boolean, a ref, or a conditional
   * prop.
   */
  disabled?: ConditionalProp<TContext>

  /**
   * Whether the form is in read-only mode. Accepts a boolean, a ref, or a
   * conditional prop.
   */
  readonly?: ConditionalProp<TContext>

  /**
   * The source that triggers re-evaluation of the form's async conditional
   * props. Accepts an array of element paths whose values are watched, a `Ref`,
   * or a function used as a watch getter. When omitted, any change in the form
   * model re-triggers evaluation.
   */
  conditionsTrigger?: ConditionsTriggerProp

  /**
   * The debounce delay in milliseconds applied before re-evaluating the form's
   * async conditional props when the trigger source changes. Overrides the
   * global `$conditions.debounce` config (default `300`).
   */
  conditionsDebounce?: number

  /**
   * The HTTP method for form submission (e.g. POST, PUT).
   */
  method?: RequestMethod

  /**
   * The URL or async function handling form submission.
   */
  endpoint?: EndpointProp

  /**
   * URL to redirect to after successful submission.
   */
  redirect?: TProp<string, TContext>

  /**
   * Message displayed after successful form submission.
   */
  successMessage?: TProp<string, TContext>

  /**
   * Whether to reset the form after successful submission.
   */
  resetOnSuccess?: boolean

  /**
   * Whether to clear the form after successful submission.
   */
  clearOnSuccess?: boolean

  /**
   * Whether to set validation errors on elements from a 422 server response.
   */
  setInvalid?: boolean

  /**
   * Whether to update form data with the server response data.
   */
  setResponse?: boolean

  /**
   * Whether to send form data as JSON instead of FormData.
   */
  json?: boolean

  /**
   * Whether to encode file uploads as base64.
   */
  base64?: boolean

  /**
   * Custom HTTP headers to include in the submission request.
   */
  headers?: Record<string, string>

  /**
   * Token overrides applied to the form's CSS custom properties.
   */
  tokens?: ThemeTokens

  /**
   * Controls which props allow dynamic expression resolution. Set to `false` to
   * disable all expression evaluation, `true` to enable for all expressionable
   * props, or an array of prop keys to enable selectively.
   */
  expressions?: ExpressionsProp

  /**
   * Form-level expression constants. Each value is a TProp that is resolved and
   * merged into the expression evaluation scope. Names already registered in
   * `config.$expression.consts` keep the config value — the form-level entry is
   * ignored.
   */
  consts?: Record<string, TProp>

  /**
   * Forces the form into dark or light mode regardless of the environment.
   *
   * **Requires `build.scopedDarkMode: true` in the `createVueform` config.**
   */
  dark?: boolean

  /**
   * Transforms form data before submission.
   *
   * @param payload The form payload to transform.
   * @param context$ The form's component context.
   */
  transformPayload?: (
    payload: Record<string, any>,
    context$: any
  ) => Record<string, any>

  /**
   * Transforms the server's validation error response.
   *
   * @param data The raw error response data.
   * @param context$ The form's component context.
   */
  transformServerInvalid?: (
    data: Record<string, any>,
    context$: any
  ) => Record<string, any>

  /**
   * Transforms the server response data when `setResponse` is enabled.
   *
   * @param data The raw response payload.
   * @param context$ The form's component context.
   */
  transformResponse?: (data: any, context$: any) => Record<string, any>
}

/**
 * Events emitted by the form component.
 */
export interface FormEmits<TContext = any>
  extends BaseComponentEmits<TContext>, TabbedEmits {
  /**
   * Emitted when the active step changes.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  step: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted when navigating to the previous step.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  back: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted when navigating to the next step.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  next: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted before the active step changes, allowing cancellation.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  beforeStep: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted before navigating to the previous step, allowing cancellation.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  beforeBack: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted before navigating to the next step, allowing cancellation.
   *
   * @param newPage The step being navigated to.
   * @param oldPage The step being navigated from.
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  beforeNext: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: TContext,
  ]

  /**
   * Emitted before the form finishes (submits from the last step), allowing
   * cancellation.
   *
   * @param pager The pager instance managing step state.
   * @param context$ The form's component context.
   */
  beforeFinish: [pager: Pager, context$: TContext]

  /**
   * Emitted when any form element's value changes, with the new and previous
   * values.
   *
   * @param newValue The new form data.
   * @param oldValue The previous form data.
   * @param context$ The component context.
   */
  change: [
    newValue: Record<string, any>,
    oldValue: Record<string, any>,
    context$: TContext,
  ]

  /**
   * Emitted when the form is reset to its default values.
   *
   * @param context$ The form's component context.
   */
  reset: [context$: TContext]

  /**
   * Emitted when the form is cleared.
   *
   * @param context$ The form's component context.
   */
  clear: [context$: TContext]

  /**
   * Emitted when form data is loaded programmatically via the `load` method.
   *
   * @param value The loaded model value.
   * @param context$ The form's component context.
   */
  load: [value: any, context$: TContext]

  /**
   * Emitted before the autosave request is sent. Return `false` to cancel, a
   * `string` to use as the endpoint URL, or an `HttpResponse` to use as the
   * result without making a request.
   *
   * @param payload The form payload to be autosaved.
   * @param context$ The form's component context.
   */
  autosave: [payload: Record<string, any>, context$: TContext]

  /**
   * Emitted before a locally stored autosave draft is restored into the form on
   * mount. Return `false` to skip the restore (the stored draft is kept).
   *
   * @param data The stored draft data about to be loaded.
   * @param context$ The form's component context.
   */
  autosaveRestore: [data: Record<string, any>, context$: TContext]

  /**
   * Emitted after a successful autosave operation.
   *
   * @param response The HTTP response from the autosave request.
   * @param context$ The form's component context.
   */
  autosaveSuccess: [response: HttpResponse, context$: TContext]

  /**
   * Emitted when an autosave request fails due to a network or server error.
   *
   * @param error The HTTP error that caused the failure.
   * @param context$ The form's component context.
   */
  autosaveFail: [error: HttpError, context$: TContext]

  /**
   * Emitted when the form becomes invalid due to client-side validation errors.
   *
   * @param context$ The form's component context.
   */
  invalid: [context$: TContext]

  /**
   * Emitted when the form passes validation.
   *
   * @param context$ The form's component context.
   */
  valid: [context$: TContext]

  /**
   * Emitted when the form is submitted, before the HTTP request is sent.
   *
   * @param payload The submitted form payload.
   * @param context$ The form's component context.
   */
  submit: [payload: FormData | Record<string, any>, context$: TContext]

  /**
   * Emitted when an HTTP response is received from the server.
   *
   * @param response The HTTP response object.
   */
  response: [response: HttpResponse]

  /**
   * Emitted when form submission fails due to a network or server error.
   *
   * @param result The failure result object.
   */
  fail: [result: SubmitFail]

  /**
   * Emitted when form submission fails due to validation errors.
   *
   * @param result The invalid result object.
   */
  serverInvalid: [result: SubmitServerInvalid]

  /**
   * Emitted when form submission succeeds.
   *
   * @param result The success result object.
   */
  success: [result: SubmitSuccess]

  /**
   * Emitted when form submission is cancelled before sending a request (e.g.
   * the form is invalid, loading, disabled, already submitting, or a `submit`
   * handler / `endpoint` function returned `false`).
   *
   * @param result The cancelled result object.
   */
  cancelled: [result: SubmitCancelled]

  /**
   * Emitted to update the v-model binding.
   *
   * @param value The new model value.
   */
  'update:modelValue': [value: Record<string, any>]
}

/**
 * Slots of the form component.
 */
export interface FormSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the form component.
 */
export interface FormParts extends BaseComponentParts {}

/**
 * CSS classes of the form component.
 */
export interface FormClasses extends BaseComponentClasses {}

/**
 * Augmentable public API surface for form-based components.
 */
export interface FormExpose extends BaseComponentExpose, FormApi {}

/**
 * Result returned when form submission succeeds with a server response.
 */
export interface SubmitSuccess {
  /**
   * The result type discriminator, always 'success'.
   */
  type: 'success'

  /**
   * The response data returned by the server.
   */
  data: any

  /**
   * The HTTP status code of the response.
   */
  status: number

  /**
   * The full HTTP response object.
   */
  response: HttpResponse

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Result returned when form submission is rejected due to client-side
 * validation errors.
 */
export interface SubmitClientInvalid {
  /**
   * The result type discriminator, always 'invalid'.
   */
  type: 'invalid'

  /**
   * The error source, always 'client' for client-side validation failures.
   */
  source: 'client'

  /**
   * Validation errors keyed by element path.
   */
  errors: Record<string, string[]>

  /**
   * Structured validation issues (`{ path, rule, message }`) — the same
   * projection as `form$.issues` at the time of submission.
   */
  issues: Issue[]

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Result returned when the server responds with a 422 validation error.
 */
export interface SubmitServerInvalid {
  /**
   * The result type discriminator, always 'invalid'.
   */
  type: 'invalid'

  /**
   * The error source, always 'server' for 422 validation responses.
   */
  source: 'server'

  /**
   * Validation errors keyed by element path, transformed via
   * `transformServerInvalid`.
   */
  errors: Record<string, string[]>

  /**
   * Structured issues synthesized from `errors` (`rule: 'server'`), mirroring
   * the client-side `issues` shape.
   */
  issues: Issue[]

  /**
   * The raw response data from the server.
   */
  data: any

  /**
   * The full HTTP response object.
   */
  response: HttpResponse

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Union of client-side and server-side validation failure results.
 */
export type SubmitInvalid = SubmitClientInvalid | SubmitServerInvalid

/**
 * Result returned when form submission fails due to a network or server error.
 */
export interface SubmitFail {
  /**
   * The result type discriminator, always 'fail'.
   */
  type: 'fail'

  /**
   * The category of the failure (e.g. network error, timeout, abort, an origin
   * blocked by `$security.allowOrigins`, or an SSR-time request).
   */
  reason:
    | 'network'
    | 'timeout'
    | 'http'
    | 'abort'
    | 'blocked'
    | 'ssr'
    | 'unknown'

  /**
   * The HTTP status code, or null if no response was received.
   */
  status: number | null

  /**
   * A human-readable error message describing the failure.
   */
  message: string

  /**
   * The response data if available, or null.
   */
  data: any | null

  /**
   * The HTTP response object if available, or null.
   */
  response: HttpResponse | null

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Result returned when form submission is cancelled before sending a request.
 */
export interface SubmitCancelled {
  /**
   * The result type discriminator, always 'cancelled'.
   */
  type: 'cancelled'

  /**
   * The reason the submission was cancelled (e.g. form was invalid, disabled,
   * or already submitting).
   */
  reason: 'loading' | 'disabled' | 'submitting' | 'prevented' | 'unknown'

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Discriminated union of all possible form submission outcomes.
 */
export type SubmitResult =
  | SubmitSuccess
  | SubmitInvalid
  | SubmitFail
  | SubmitCancelled

/**
 * Factory API produced by the form blueprint's `blueprint` function, optionally
 * parameterized by concrete props (e.g. `FormApi<VfFormProps<typeof schema>>`).
 * Prefer this over `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type FormApi<
  // `any` in the schema slot: `MaybeRef<TSchema>` is invariant through `Ref`,
  // so a `FormSchema`-typed constraint would reject every concrete schema.
  TProps extends FormProps<any, any, any, any, any> = FormProps,
> = FormApiBase & FormSchemaApi<FormPropsSchema<TProps>>

/**
 * The schema-driven slice of the form factory API. When `TSchema` is a concrete
 * schema (e.g. from `defineSchema` via the `schema` prop), paths, element
 * contexts, and model shapes are all derived from it; with the wide
 * `FormSchema` every member falls back to its loose form.
 */
export type FormSchemaApi<TSchema = FormSchema> = {
  /**
   * Finds a registered element by its path or data path. Known schema paths are
   * suggested and return the element's schema-narrowed context; unknown paths
   * are accepted and return an untyped element.
   *
   * @param path The element path or data path to look up.
   */
  find: <P extends Paths<TSchema> | (string & {})>(
    path: P
  ) => ElementByPath<TSchema, P> | undefined

  /**
   * Returns the value of the element at the given path. When the path is
   * suffixed with `@propName` it returns that property of the element's context
   * instead of its model value.
   *
   * @param path The element path, optionally suffixed with `@propName`.
   */
  get: <P extends Paths<TSchema> | (string & {})>(
    path: P
  ) => GetResult<TSchema, P>

  /**
   * Sets the value of the element at the given path, falling back to writing
   * the root model directly when no element is registered there.
   *
   * @param path The element path to set.
   * @param value The value to assign.
   */
  set: <P extends Paths<TSchema> | (string & {})>(
    path: P,
    value: ModelByPath<TSchema, P>
  ) => void

  /**
   * The root reactive model object holding all form element values.
   */
  model: Ref<SchemaToModel<TSchema>>

  /**
   * The full model data — an alias of `model`.
   */
  data: Ref<SchemaToModel<TSchema>>

  /**
   * A snapshot of the model at mounted time, used for dirty checking and reset.
   */
  initialModel: Ref<SchemaToModel<TSchema>>

  /**
   * The aggregated submission payload derived from all child elements.
   */
  payload: ComputedRef<SchemaToModel<TSchema>>

  /**
   * Updates form element values programmatically from a (partial) data object.
   *
   * @param data The data to load into the form.
   */
  update: (data: DeepPartial<SchemaToModel<TSchema>>) => void
}

/**
 * Builds the form factory API from resolved props and events. Sets up the root
 * model, validation, submission, multi-step navigation, and child element
 * registry.
 *
 * Kept un-annotated so its inferred return feeds `FormApiBase`; the exported
 * `blueprint` wrapper overlays the schema-typed slice (`FormApi<TProps>`).
 */
function setup(
  props: LooseRequired<FormProps>,
  events: DefineEvents<FormEmits>
) {
  let abortController: AbortController | null = null

  const form$ = createFormContext()
  const context$ = form$ as any

  const config = useConfig()

  const expression = useExpression()

  /**
   * The form's http instance for endpoint submissions. Acquired in setup —
   * `submit()` runs after awaits, outside the injection context — and never
   * throws for a missing `http` module: the request itself rejects instead.
   */
  const $http = useHttp()

  /**
   * Optional name identifying this form instance in DevTools and debugging.
   */
  const name = computed(() => props.name)

  /**
   * Unique identifier for this form instance, used for accessibility
   * attributes.
   */
  const uid = ref(config.uid())
  const $el = useCurrentElement()
  const { localizeObject } = useLocale()

  // =============== EVENTS ===============

  /**
   * Event system methods for subscribing to, unsubscribing from, and emitting
   * form events.
   */
  const { on, off, fire, fireAsync } = events

  // =============== THEME ================

  const { tokens, nonce, tokenClass, tokenCss } = useTokens(
    toRef(props, 'tokens'),
    toRef(() => props.dark)
  )

  // ============= LANGUAGES ==============

  /**
   * The localized map of available languages for multilingual forms.
   */
  const languages = computed(() =>
    localizeObject(props.languages || config.languages)
  )

  const defaultLanguage = toRef(
    () => props.language || Object.keys(languages.value)[0]
  )

  /**
   * The currently active language in multilingual forms.
   */
  const language = ref(defaultLanguage.value)

  // =============== SCHEMA ===============

  /**
   * The resolved and normalized schema used to render child elements.
   */
  const resolvedSchema = useSchema(
    toRef(() => unref<FormSchema | undefined>(props.schema))
  )

  // ============== REGISTRY ==============

  /**
   * Registry tracking all child components of the form. `flat: true` also
   * maintains `elements$` — every descendant keyed by full path.
   */
  const children = useChildren(undefined, { flat: true })

  /**
   * Map of all registered form elements keyed by their path.
   */
  const elements$ = children.flatChildren$!

  /**
   * Map of all registered child components keyed by their path.
   */
  const children$ = children.children$

  const dataPathIndex = new Map<string, string[]>()

  // ================ MODEL ===============

  const modelValue = toRef(() => props.modelValue)

  /**
   * Custom validation error messages keyed by rule name.
   *
   * @private
   */
  const ruleMessages = toRef(() => props.ruleMessages)
  const transformPayload = toRef(() => props.transformPayload)

  /**
   * Aggregated payload, validation state, and data manipulation methods derived
   * from all child elements, plus the root model providing the form's reactive
   * data model, initial snapshot, and model registration.
   */
  const {
    rootModel: maybeRootModel,
    payload,
    sensitivePaths,
    invalid,
    dirty,
    pending,
    debouncing,
    busy,
    validated,
    completed,
    empty,
    hasError,
    messages,
    messageBag,
    formErrors,
    validator,
    update,
    reset,
    clear,
    load,
    validate,
    unvalidate,
    invalidate,
    clean,
    clearErrors,
    clearMessages,
    clearMessageBag,
  } = useData({
    root: true,
    children,
    modelValue,
    ruleMessages,
    transformPayload,
    ...events,
  })

  const rootModel = maybeRootModel!
  const modelModule = getModelModule()

  const {
    initialModel,
    model,
    index,
    register: registerModel,
    unregister: unregisterModel,
    set: setModel,
  } = rootModel

  /**
   * The full model data — an alias of `model`.
   */
  const data = model

  /**
   * Whether the form adopted a `useModel` instance's store (passed via
   * `v-model` / the `modelValue` prop).
   */
  const hasAdoptedModel = rootModel.adopted

  // Expression tracking controller for this form's index. Adopted `useModel`
  // instances already created one (their engine tracks walk nodes); plain
  // forms get a fresh controller here, and mounted elements init their claimed
  // nodes against it. No-op when the expression module isn't installed.
  const expressionTracking = getExpressionModule().makeExpressionTracking(index)

  expressionTracking.activate({
    store: rootModel.store,
    config,
    languages: () => languages.value,
    consts: () => resolvedConsts.value,
    expressions: () => props.expressions,
  })

  /**
   * Index nodes created by mounted registration (as opposed to the adopted
   * instance's schema walk). They are removed again on unregistration — walk
   * nodes are only unclaimed, since they must outlive the form.
   */
  const mountedNodes = new Set<ModelNode>()

  /**
   * Claims the index node at the given path for a mounted component context,
   * creating the node when the walk didn't produce one (plain forms,
   * template-driven elements, list rows beyond the initial count).
   */
  const claimIndexNode = (context$: any, path: string, dataPath?: string) => {
    let node = index.nodes.get(path)

    if (!node) {
      node = modelModule.makeMountedNode({ path, dataPath })
      index.nodes.set(path, node)
      mountedNodes.add(node)
    }

    node.el$ = context$
    index.version.value++
  }

  /**
   * Releases the index node claim at the given path (identity-guarded when an
   * instance is passed, since a reorder's sibling may have already claimed it).
   * Registration-created nodes are removed entirely.
   */
  const unclaimIndexNode = (path: string, instance?: any) => {
    const node = index.nodes.get(path)
    if (!node) return
    if (instance !== undefined && node.el$ !== instance) return

    node.el$ = undefined

    if (mountedNodes.has(node)) {
      expressionTracking.release(node)
      index.nodes.delete(path)
      mountedNodes.delete(node)
    }

    index.version.value++
  }

  /**
   * Validation errors for all elements, keyed by element path, plus the form's
   * own root-level errors under the `''` key (e.g. unmatched Standard Schema
   * issues).
   */
  const errors = computed(() => {
    let result: Record<string, string[]> = {}
    for (const [_path, el$] of elements$) {
      Object.assign(result, el$.formErrors)
    }
    Object.assign(result, formErrors.value)
    return result
  })

  /**
   * Set of language codes that have validation errors across any translatable
   * element in the form.
   */
  const invalidLanguages = computed(() => {
    const result = new Set<string>()
    for (const el$ of elements$.values()) {
      if (!el$?.invalidLanguages) continue
      for (const lang of el$.invalidLanguages) result.add(lang)
    }
    return result
  })

  // ================ STEPS ===============

  /**
   * Pager instance managing multi-step wizard navigation and state.
   */
  const steps = usePager({
    active: toRef(() => props.stepped),
    schema: resolvedSchema,
    children,
    history: toRef(() => props.history),
    sequential: true,
    onSelect: (newPage, oldPage) =>
      fire('step', newPage, oldPage, steps, form$),
    onNext: async (newPage, oldPage) => {
      await scrollToTopIfShouldOn('next')
      fire('next', newPage, oldPage, steps, form$)
    },
    onBack: async (newPage, oldPage) => {
      await scrollToTopIfShouldOn('back')
      fire('back', newPage, oldPage, steps, form$)
    },
    onInvalid: async (page) => {
      const el$ = findFirstError([page.el$])
      if (!el$) return

      if (props.focusError) {
        el$.focus()
        el$.scrollTo(props.scrollOptions)
      } else if (props.scrollToError) {
        el$.scrollTo(props.scrollOptions)
      } else {
        scrollToTopIfShouldOn('error')
      }
    },
    onFinish: async () => await submit(),
    onBeforeSelect: async (newPage, oldPage) =>
      await fireAsync('beforeStep', newPage, oldPage, steps, form$),
    onBeforeNext: async (newPage, oldPage) =>
      await fireAsync('beforeNext', newPage, oldPage, steps, form$),
    onBeforeBack: async (newPage, oldPage) =>
      await fireAsync('beforeBack', newPage, oldPage, steps, form$),
  })

  /**
   * Synchronizes step states based on which steps contain data, enabling steps
   * up to the last one with values.
   */
  const syncSteps = () => {
    let lastWithData = 0

    for (const page of steps.pages) {
      if (page.el$ && !page.el$.empty) {
        lastWithData = page.index
      }
    }

    if (lastWithData > 0) {
      steps.enableUntil(lastWithData)
      steps.select(lastWithData)
    }
  }

  on('reset', steps.reset)

  onMounted(async () => {
    if (!props.stepped || !props.syncSteps) return
    await nextTick()
    syncSteps()
  })

  // ================ TABS ================

  /**
   * Pager instance managing tab-based navigation and state.
   */
  const tabs = usePager({
    active: toRef(() => props.tabbed),
    schema: resolvedSchema,
    children,
    onSelect: (newPage, oldPage) => fire('tab', newPage, oldPage, tabs, form$),
    onBeforeSelect: async (newPage, oldPage) =>
      await fireAsync('beforeTab', newPage, oldPage, tabs, form$),
  })

  on('reset', tabs.reset)

  // ================ REFS ================

  /**
   * The number of times the form has been submitted.
   */
  const submits = ref(0)

  /**
   * Whether the form is currently being submitted.
   */
  const submitting = ref(false)

  /**
   * Whether the form is currently being validated.
   */
  const validating = ref(false)

  /**
   * Whether submit-time validation is currently disabled (see
   * `disableValidation` / `enableValidation`).
   */
  const validationDisabled = ref(false)

  /**
   * Turns off the form's built-in submit-time validation entirely — the floor
   * that otherwise always runs regardless of `validateOn`. Deliberately a
   * programmatic call rather than a prop: opting out of validation should be an
   * explicit act in code, not a template flag. `enableValidation` turns it back
   * on.
   */
  const disableValidation = () => {
    validationDisabled.value = true
  }

  /**
   * Re-enables the form's submit-time validation after `disableValidation`.
   */
  const enableValidation = () => {
    validationDisabled.value = false
  }

  /**
   * The HTTP response from the most recent submission.
   */
  const response = ref<HttpResponse | undefined>()

  /**
   * The result object from the most recent submission attempt.
   */
  const result = ref<SubmitResult | undefined>()

  const errorLevel = toRef(props, 'errorLevel')

  const headers = toRef(() => props.headers)
  const json = toRef(() => props.json)
  const base64 = toRef(() => props.base64)

  /**
   * The currently active pager (steps or tabs), or undefined if neither is
   * active.
   */
  const pager = toRef(() =>
    props.stepped ? steps : props.tabbed ? tabs : undefined
  )

  // ============== COMPUTED ==============

  /**
   * The DOM id for the form's error container element.
   */
  const errorsId = computed(() => `${uid.value}__errors`)

  /**
   * The DOM id for the form's messages container element.
   */
  const messagesId = computed(() => `${uid.value}__messages`)

  /**
   * Whether form-level validation errors should be displayed.
   */
  const showErrors = computed(
    () =>
      !props.hideErrors &&
      (errorLevel.value === 'form' || errorLevel.value === 'all')
  )

  /**
   * Whether the form is in a loading state (explicit prop or busy children).
   */
  const loading = computed(() => props.loading || !!busy.value)

  /**
   * Whether the form is in read-only mode.
   */
  const readonly = computed(() => {
    const val = unref<ConditionalProp | undefined>(props.readonly)
    return typeof val === 'function' ? !!val(context$) : !!val || val === ''
  })

  /**
   * Whether the form is disabled, resolved from a boolean, ref, or conditional
   * function prop.
   */
  const disabled = computed(() => {
    const val = unref<ConditionalProp | undefined>(props.disabled)
    return typeof val === 'function' ? !!val(context$) : !!val || val === ''
  })

  const endpoint = computed(() =>
    typeof props.endpoint === 'string'
      ? expression.resolveIfAllowed('endpoint', props.endpoint)
      : undefined
  )

  const successMessage = useDynamicProp('successMessage', props, {
    localize: true,
    string: true,
  })

  const redirect = useDynamicProp('redirect', props, {
    localize: true,
    string: true,
    safeUrl: ['http', 'https'],
  })

  /**
   * Resolved form-level expression constants. Each TProp value is resolved to a
   * primitive and made available to the expression evaluation scope.
   */
  const resolvedConsts = computed(() => {
    const raw = props.consts
    if (!raw) return undefined
    const registered = config.$expression?.consts
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(raw)) {
      if (registered && key in registered) continue
      if (typeof value === 'function') {
        result[key] = value(context$)
      } else {
        const unwrapped = unref(value)
        if (
          unwrapped &&
          typeof unwrapped === 'object' &&
          !Array.isArray(unwrapped)
        ) {
          result[key] = localizeObject(unwrapped as Record<string, string>)
        } else {
          result[key] = unwrapped
        }
      }
    }
    return result
  })

  // ============== METHODS ===============

  /**
   * Finds a registered element by its path or data path. When the form adopted
   * a `useModel` instance, unmounted schema elements resolve to their virtual
   * contexts as a last resort.
   *
   * @param path The element path or data path to look up.
   */
  const find = (path: string) => {
    return (
      elements$.get(path) ?? findByDataPath(path) ?? rootModel.modelFind?.(path)
    )
  }

  /**
   * Finds a registered element by its data path.
   *
   * @param dataPath The data path to look up.
   */
  const findByDataPath = (dataPath: string): any => {
    for (const el of elements$.values()) {
      if (el?.dataPath === dataPath) return el
    }
  }

  /**
   * Returns all sibling elements that share the same parent path.
   *
   * @param path The element path whose siblings to find.
   */
  const findSiblings = (path: string): any[] => {
    const lastDot = path.lastIndexOf('.')
    const parentPath = lastDot === -1 ? '' : path.substring(0, lastDot)
    const prefix = parentPath === '' ? '' : `${parentPath}.`

    const result: any[] = []
    for (const [elPath, instance] of elements$) {
      const key = String(elPath)
      if (
        key.startsWith(prefix) &&
        !key.substring(prefix.length).includes('.')
      ) {
        result.push(instance)
      }
    }
    return result
  }

  /**
   * Gets the value of an element by path, falling back to the raw model value.
   * When the path contains a `@` separator (e.g. `name@label` or
   * `name@nested.prop`), returns the specified property from the element
   * context instead of its model value.
   *
   * @param path The element path, optionally suffixed with `@propName`.
   */
  const get = (path: string): any => {
    const atIdx = path.indexOf('@')

    if (atIdx !== -1) {
      const elPath = path.slice(0, atIdx)
      const propPath = path.slice(atIdx + 1)
      const element = find(elPath)
      return element ? getByPath(element, propPath) : undefined
    }

    const element = find(path)
    return element ? element.model : getByPath(model.value, path)
  }

  /**
   * Sets the value of an element by path, or updates the raw model if the
   * element is not found.
   *
   * @param path The element path to set.
   * @param value The value to assign.
   */
  const set = (path: string, value: any): void => {
    const element = find(path)
    if (element) {
      element.update(value)
    } else {
      setModel(path, value)
    }
  }

  /**
   * Serializes the current model value to a JSON string.
   */
  const toJSON = rootModel.store.toJSON

  /**
   * Serializes the current model value to a `FormData` instance.
   */
  const toFormData = rootModel.store.toFormData

  // ========== STANDARD SCHEMA ===========

  const { makeFormValidation } = getValidationModule()

  /**
   * The active form-level Standard Schema: the explicit `validationSchema`
   * prop, the adopted `useModel` instance's, or one attached to the schema via
   * `defineSchema`'s second argument, in that order. The instance precedes the
   * attachment so adoption never swaps the schema the instance already
   * validates with on the shared validator (the instance's own resolution falls
   * back to the attachment when it has no explicit option).
   */
  const validationSchema = computed(
    () =>
      props.validationSchema ??
      (modelModule.hasModelStore(props.modelValue)
        ? props.modelValue.validationSchema
        : undefined) ??
      getAttachedValidationSchema(props.schema)
  )

  if (isDev() && props.validationSchema) {
    const attached = getAttachedValidationSchema(props.schema)
    if (attached && attached !== props.validationSchema) {
      warn(
        'The `validationSchema` prop overrides the Standard ' +
          "Schema attached via `defineSchema`'s second argument"
      )
    }
  }

  /**
   * The form-side validation view-model: installs the resolved schema on the
   * validator and exposes the form's structured issues and Standard Schema
   * export.
   */
  const { issues, toStandardSchema } = makeFormValidation({
    // @q: where issues is used?
    validator,
    validationSchema,
  })

  const scrollToTopIfShouldOn = async (key: ScrollTopOnProp[number]) => {
    if (
      props.scrollTopOn?.includes(key) ||
      props.scrollTopOn?.includes('always')
    ) {
      scrollToTop()
    }
  }

  /**
   * Scrolls the viewport to the top of the form element.
   */
  const scrollToTop = () => {
    scrollIntoViewIfNeeded(rootDomOf($el), props.scrollOptions)
  }

  const findFirstError = (items: any[]): any | undefined => {
    for (const el$ of items) {
      if (!el$.invalid && !el$.hasError) continue

      const children =
        el$.statefulChildren$ ??
        (el$.children?.children$ instanceof Map
          ? [...el$.children.children$.values()].filter((c: any) => !c.isStatic)
          : undefined)

      if (children?.length) {
        const nested = findFirstError(children)
        if (nested) return nested
      }
      if (el$.hasError) return el$
    }
  }

  /**
   * Scrolls the viewport to the first element that has a validation error.
   */
  const scrollToFirstError = async () => {
    if (!props.scrollToError) return false
    const el$ = findFirstError([...elements$.values()])
    return el$ ? await el$.scrollTo(props.scrollOptions) : false
  }

  /**
   * Focuses the first element that has a validation error and optionally
   * scrolls to it.
   *
   * @param scroll Whether to also scroll the element into view.
   */
  const focusFirstError = async (scroll: boolean | undefined = true) => {
    if (!props.focusError) return false
    const el$ = findFirstError([...elements$.values()])
    return el$ ? await el$.focus(scroll) : false
  }

  /**
   * Validates and submits the form, returning a result describing the outcome.
   */
  const submit = async (): Promise<SubmitResult | undefined> => {
    submits.value++

    result.value = undefined
    response.value = undefined

    if (loading.value || disabled.value || submitting.value) {
      result.value = {
        type: 'cancelled',
        reason: loading.value
          ? 'loading'
          : disabled.value
            ? 'disabled'
            : submitting.value
              ? 'submitting'
              : 'unknown',
        context$,
      }

      fire('cancelled', result.value)

      return result.value
    }

    if (!validationDisabled.value) {
      validating.value = true
      // Submission always validates as a floor, regardless of `validateOn`:
      // every element without a current passing result runs (never-validated,
      // stale, and currently-invalid ones alike), so an untouched form can
      // never submit unvalidated. Adding `'submit'` to `validateOn` upgrades
      // this to a forced full re-validation — prior results ignored — for
      // rules whose outcome can change without the value changing (async
      // server checks, date boundaries). `disableValidation()` is the only
      // full opt-out, deliberately programmatic-only.
      await validate(
        props.validateOn?.includes('submit') ? { force: true } : undefined
      )
      validating.value = false
    }

    if (invalid.value) {
      result.value = {
        type: 'invalid',
        source: 'client',
        errors: errors.value,
        issues: issues.value,
        context$,
      }

      if (!(await focusFirstError())) {
        if (!(await scrollToFirstError())) {
          await scrollToTopIfShouldOn('error')
        }
      }

      return result.value
    }

    submitting.value = true
    abortController = new AbortController()

    try {
      const submitResponse = await fireAsync('submit', payload.value, context$)

      if (submitResponse === false) {
        result.value = {
          type: 'cancelled',
          reason: 'prevented',
          context$,
        }

        fire('cancelled', result.value)

        return result.value
      }

      if (submitResponse !== true) {
        response.value = submitResponse as HttpResponse
      } else if (typeof props.endpoint === 'function') {
        const endpointResult = await props.endpoint(payload.value, context$)

        if (endpointResult === false) {
          result.value = {
            type: 'cancelled',
            reason: 'prevented',
            context$,
          }

          fire('cancelled', result.value)

          return result.value
        }

        if (typeof endpointResult === 'string') {
          response.value = await $http.request({
            url: endpointResult,
            method: props.method,
            data: payload.value,
            headers: props.headers,
            signal: abortController.signal,
            requestType: props.json ? 'json' : 'form',
            base64: props.base64,
          })
        } else if (endpointResult) {
          response.value = endpointResult as HttpResponse
        }
      } else if (endpoint.value) {
        response.value = await $http.request({
          url: endpoint.value,
          method: props.method,
          data: payload.value,
          headers: props.headers,
          signal: abortController.signal,
          requestType: props.json ? 'json' : 'form',
          base64: props.base64,
        })
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        const data = error.response?.data || null

        if (error.reason === 'abort') {
          result.value = {
            type: 'fail',
            reason: 'abort',
            status: null,
            message: error.message,
            data: null,
            response: null,
            context$,
          }

          fire('fail', result.value)

          return result.value
        } else if (error.status === 422) {
          // The 422 body is server-controlled and its shape is not trusted:
          // coerce the error map to `Record<string, string[]>` so a string
          // value doesn't iterate per-character and a scalar doesn't throw a
          // `TypeError` from inside error handling.
          const rawServerErrors =
            props.transformServerInvalid?.(data, context$) || {}
          const serverErrors: Record<string, string[]> = {}

          if (isPlainObject(rawServerErrors)) {
            for (const [path, messages] of Object.entries(rawServerErrors)) {
              serverErrors[path] = Array.isArray(messages)
                ? messages.filter((m): m is string => typeof m === 'string')
                : typeof messages === 'string'
                  ? [messages]
                  : []
            }
          }

          result.value = {
            type: 'invalid',
            source: 'server',
            errors: serverErrors,
            issues: Object.entries(serverErrors).flatMap(([path, messages]) =>
              messages.map((message) => ({
                path,
                rule: 'server',
                message,
              }))
            ),
            data,
            response: error.response!,
            context$,
          }

          if (error.response) {
            fire('response', error.response)
          }

          fire('serverInvalid', result.value)

          if (props.setInvalid) {
            for (const [path, messages] of Object.entries(serverErrors)) {
              const element = find(path) as any
              if (element?.messageBag) {
                for (const msg of messages) {
                  element.messageBag.append(msg, 'error')
                }
              }
            }

            if (!(await focusFirstError())) {
              if (!(await scrollToFirstError())) {
                await scrollToTopIfShouldOn('error')
              }
            }
          }

          return result.value
        } else {
          result.value = {
            type: 'fail',
            reason: error.reason,
            status: error.status || null,
            message: error.message,
            data,
            response: error.response || null,
            context$,
          }

          if (error.response) {
            fire('response', error.response)
          }

          fire('fail', result.value)

          return result.value
        }
      } else {
        throw new Error(error)
      }
    } finally {
      submitting.value = false
      abortController = null
    }

    if (
      response.value &&
      typeof response.value.status === 'number' &&
      (response.value.status < 200 || response.value.status >= 300)
    ) {
      result.value = {
        type: 'fail',
        reason: 'http',
        status: response.value.status,
        message: `Request failed with status ${response.value.status}`,
        data: response.value.data ?? null,
        response: response.value,
        context$,
      }

      fire('response', response.value)
      fire('fail', result.value)

      return result.value
    }

    if (response.value) {
      result.value = {
        type: 'success',
        data: response.value.data,
        status: response.value.status,
        response: response.value,
        context$,
      }

      fire('response', response.value)
      fire('success', result.value)

      if (successMessage.value) {
        messageBag.append(successMessage.value, 'message')
      }

      if (props.resetOnSuccess) {
        reset()
      }

      if (props.clearOnSuccess) {
        clear()
      }

      if (props.setResponse) {
        const responseData =
          props.transformResponse?.(response.value.data, context$) || {}

        if (Object.keys(responseData).length) {
          update(responseData)
        }
      }

      await scrollToTopIfShouldOn('success')

      if (redirect.value) {
        nextTick(() => {
          window.location.href = redirect.value!
        })
      }

      return result.value
    }

    return result.value
  }

  /**
   * Aborts the current in-flight submission request.
   */
  const abort = () => {
    abortController?.abort()
  }

  /**
   * Registers a child element with the form, setting up its model and data path
   * tracking.
   *
   * @param context$ The child element's component context.
   * @param path The element's unique path in the form tree.
   * @param dataPath The element's path in the form data model.
   * @param initialModel The element's initial model value.
   */
  const registerChild = (
    context$: any,
    path: string,
    dataPath?: string,
    initialModel?: any
  ) => {
    children.register(path, context$)
    claimIndexNode(context$, path, dataPath)

    if (dataPath) {
      if (!dataPathIndex.has(dataPath)) dataPathIndex.set(dataPath, [])
      const paths = dataPathIndex.get(dataPath)!
      paths.push(path)

      if (paths.length > 1) {
        console.error(
          `[Vueform error]: Multiple elements (\`${paths.join('`, `')}\`) share the same \`dataPath\`: "${dataPath}". ` +
            `Ensure each element has a unique \`dataPath\` by avoiding non-nested groups ` +
            `with children that share names with other elements at the same data level.`
        )
      }
    }

    if (!dataPath) return
    registerModel(dataPath, initialModel)
  }

  /**
   * Unregisters a child element from the form, cleaning up its model and data
   * path tracking.
   *
   * @param path The element's unique path in the form tree.
   * @param dataPath The element's path in the form data model.
   * @param instance When provided, registry entries are only removed if they
   *   still belong to this instance.
   */
  const unregisterChild = (path: string, dataPath?: string, instance?: any) => {
    children.unregister(path, instance)
    unclaimIndexNode(path, instance)

    if (dataPath) {
      const paths = dataPathIndex.get(dataPath)
      if (paths) {
        const idx = paths.indexOf(path)
        if (idx !== -1) paths.splice(idx, 1)
        if (!paths.length) dataPathIndex.delete(dataPath)
      }
    }

    if (!dataPath) return
    unregisterModel(dataPath)
  }

  /**
   * Updates a child element's value in the root model by its data path.
   */
  const updateChild = setModel

  /**
   * Sets the active language for multilingual forms.
   *
   * @param lang The language code to activate.
   */
  const selectLanguage = (lang: string) => (language.value = lang) // @todo: could this be in settingContext?

  /**
   * Handles language selection from the UI.
   *
   * @param lang The language code selected by the user.
   */
  const handleLanguageSelect = (lang: string | number) =>
    selectLanguage(String(lang))

  /**
   * Handles form submission triggered from the UI.
   */
  const handleSubmit = () => submit()

  // ============== AUTOSAVE ==============

  const { autosave, clearAutosaved, loadAutosaved } = useAutosave({
    autosave: toRef(() => props.autosave),
    payload,
    model,
    sensitivePaths,
    invalid,
    headers,
    json,
    base64,
    name: toRef(() => props.name),
    load,
    ...events,
  })

  // ============= CONTAINER ==============

  createContainerContext({
    type: 'root',
    id: uid,
    pager,
    model,
    children,
    register: registerChild,
    unregister: unregisterChild,
    update: updateChild,
    subscribe: rootModel.subscribe,
  })

  return {
    config,
    name,
    loading,
    disabled,
    readonly,
    showErrors,
    tokens,
    tokenClass,
    tokenCss,
    nonce,
    elements$,
    children$,
    resolvedSchema,
    errorsId,
    messagesId,
    tabs,
    steps,
    language,
    languages,
    submits,
    submitting,
    validating,
    validationDisabled,
    disableValidation,
    enableValidation,
    model,
    data,
    index,
    initialModel,
    resolvedConsts,
    payload,
    invalid,
    dirty,
    pending,
    debouncing,
    busy,
    validated,
    completed,
    empty,
    errors,
    invalidLanguages,
    hasError,
    ruleMessages,
    messages,
    messageBag,
    validator,
    issues,
    toStandardSchema,
    uid,
    pager,
    children,
    result,
    response,
    update,
    reset,
    clear,
    load,
    syncSteps,
    validate,
    unvalidate,
    invalidate,
    clean,
    clearErrors,
    clearMessages,
    clearMessageBag,
    submit,
    abort,
    autosave,
    clearAutosaved,
    loadAutosaved,
    on,
    off,
    fire,
    fireAsync,
    find,
    findByDataPath,
    findSiblings,
    get,
    set,
    toJSON,
    toFormData,
    hasAdoptedModel,
    scrollToTop,
    scrollToFirstError,
    focusFirstError,
    selectLanguage,
    handleSubmit,
    handleLanguageSelect,
    registerChild,
    unregisterChild,
    updateChild,
  }
}

/**
 * Builds the form factory API from resolved props and events, with the
 * schema-driven slice (`find` / `get` / `set` / model fields) typed from the
 * `schema` prop carried by `TProps`.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends FormProps<any, any, any, any, any>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<FormEmits>
) {
  // The runtime members are schema-agnostic; only their types narrow.
  return setup(props, events) as FormApi<TProps>
}

/**
 * Default prop values for the form blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<FormProps>()({
  back: true,
  progress: true,
  nav: true,
  syncSteps: true,
  scrollToError: true,
  focusError: true,
  clearCustomErrors: true,
  errorLevel: 'all',
  method: 'POST',
  dark: undefined,
  navPos: 'auto',
  expressions: undefined,

  showRequired: () => ['label'],
  scrollTopOn: () => ['always'],
  scrollOptions: () => ({ behavior: 'smooth' as const }),
  validateOn: () => ['blur', 'next'],
  // Function-typed props take function defaults literally (like Vue), so
  // these are the default values themselves, not factories.
  transformPayload: (data: Record<string, any>) => data,
  transformServerInvalid: (data: Record<string, any> | null) =>
    data?.errors || data || {},
  transformResponse: (data: any) => data?.payload || {},
})
