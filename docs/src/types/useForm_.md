```ts
/**
 * Creates a form component preconfigured with the given props and model,
 * returning it alongside the form context and a ready registrar. The model is
 * bound according to its shape: `useModel` instances are attached, refs are
 * two-way synced, reactive objects are synced back on update, and plain objects
 * seed the initial value. Any option may be a ref or computed. Setup-only when
 * called without `vueform`.
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
