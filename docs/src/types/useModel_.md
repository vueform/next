```ts
/**
 * Creates a standalone form model from a schema, without mounting any
 * components. The returned instance owns the data and exposes the data API;
 * passing it to a form's `v-model` (or `useForm`) makes the form attach it.
 * With an `endpoint` (and the other submission options), `submit()` runs the
 * same submission flow as a form — validation floor, `submit` event / endpoint
 * dispatch, request, result events — headlessly. Setup-only.
 *
 * @param options.schema The form schema describing the model's shape. A
 *   ref/computed schema keeps the instance in sync with schema changes.
 * @param options.validationSchema A Standard Schema (Zod, Valibot, ArkType, …)
 *   run by `validate()` against the whole model for form-level validation.
 * @param options.languages The language map used to expand translatable values,
 *   overriding `config.languages` (element-level `languages` props still win).
 *   Pass the same map the attaching form receives so the walk and the mounted
 *   elements agree on the model shape.
 * @param options.endpoint The URL (used as-is) or async function handling the
 *   instance's own `submit()`. The other submission props (`method`, `headers`,
 *   `json`, `base64`, `setInvalid`, `setResponse`, the transforms) and the
 *   `onXxx` event callbacks (`onSuccess`, `onFail`, `onServerInvalid`,
 *   `onChange`, …) apply alongside it. While a form has attached the instance,
 *   `submit()` delegates to the form and the form's props drive submission.
 * @param seed Initial (partial) data cloned over the schema defaults.
 */
function useModel<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(
  options: {
    schema: S | Ref<S>
    validationSchema?: Z & MatchesSchemaModel<S, Z>
    languages?: LanguagesProp
  } & UseModelSubmissionOptions,
  seed?: DeepPartial<SchemaToModel<S>> & Record<string, any>
): ModelInstance<S>
```
