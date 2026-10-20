```ts
/**
 * Props for the form component blueprint, optionally parameterized by a
 * concrete schema type (`TSchema`) that drives the typed schema API (`find` /
 * `get` / `set` / `model` / `payload` / `update`).
 */
interface FormProps<
  S = FormSlots,
  P = FormParts,
  C = FormClasses,
  TContext = any,
  TSchema = FormSchema,
>
  extends
    BaseComponentProps<S, P, C, TContext>,
    TabbedProps,
    StackedProps,
    SubmissionProps {
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
   * form attaches (shared data, no cloning or v-model sync).
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
   * The alignment of the step navigation buttons: `'left'`, `'center'`,
   * `'right'`, `'fluid'` (stretched to full width), or `'auto'`.
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
}
```
