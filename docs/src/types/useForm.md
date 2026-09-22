````ts
/**
 * Creates a form component preconfigured with the given props and model,
 * returning it alongside the (not yet mounted) form context and a ready
 * registrar:
 *
 * ```ts
 * const [MyForm, form$, formReady] = useForm({ schema }, model)
 *
 * formReady((form$) => {
 *   form$.find('email')
 * })
 * ```
 *
 * The component renders VfForm with the merged props, forwards extra attrs and
 * slots, and binds the model according to its shape: `useModel` instances are
 * adopted (shared store), refs are two-way synced, reactive objects get their
 * keys synced back on update, and plain objects seed the initial value.
 *
 * Any option may be a ref or computed — unwrapped reactively at render time, so
 * changing it re-renders the form with the new value (e.g. a computed
 * `autosave` config, a `disabled` ref).
 *
 * `form$` is a live proxy to the mounted form's full context (`undefined`
 * members before mount) — use `formReady` for work that needs the mounted form.
 * When the model is a `useModel` instance, the members shared with the instance
 * (`model`, `get` / `set` / `update`, `validate`, …) already answer before
 * mount, backed by the instance's store.
 *
 * Setup-only when called without `vueform` — it resolves the calling
 * component's instance. Outside a component — plain modules, stores, tests —
 * pass your instance, or use its bound method, which does the same:
 * `vueform.useForm({ schema }, model)`.
 *
 * @param formProps Props forwarded to VfForm (e.g. `schema`).
 * @param model The form data: `useModel` instance, ref, reactive, or plain
 *   object.
 * @param vueform The Vueform instance to build from. Required outside a
 *   component context.
 */
function useForm<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(
  formProps: {
    schema: S
    validationSchema?: Z & MatchesSchemaModel<S, Z>
  } & MaybeRefProps<
    Omit<VfFormProps<S>, 'schema' | 'modelValue' | 'validationSchema'>
  > &
    EmitsToProps<VfFormEmits<S>> &
    Record<string, unknown>,
  model?: UseFormModelArg<SchemaToModel<S>>,
  vueform?: VueformInstance
): UseFormReturn<S>

function useForm(
  formProps?: Record<string, any>,
  model?: UseFormModelArg<Record<string, any>>,
  vueform?: VueformInstance
): UseFormReturn
````
