```ts
/**
 * Creates a form component preconfigured with the given props and model,
 * returning it alongside the form context and a ready registrar. The form
 * always has an engine: a passed `useModel` instance is attached as-is, and
 * with no model (or a plain-object seed) an internal instance is created from
 * the schema and attached the same way — so the context answers the engine's
 * members (data, validation, submission) before the form mounts, and the
 * mounted members join on mount. Refs are two-way synced and reactive objects
 * are synced back on update instead; their store stays the caller's. Any
 * option may be a ref or computed. Setup-only when called without `vueform`.
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

function useForm<
  const S = FormSchema,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(
  formProps?: {
    schema?: S
    validationSchema?: Z & MatchesSchemaModel<S, Z>
  } & Record<string, any>,
  model?: UseFormModelArg<Record<string, any>>,
  vueform?: VueformInstance
): UseFormReturn
```
