import type { Ref } from 'vue'

import { getModelModule, type ModelInstance } from '#src/modules/model'
import type {
  ArraySchema,
  DeepPartial,
  ExactValidatedSchema,
  FormSchema,
  MatchesSchemaModel,
  ObjectSchema,
  SchemaToModel,
  StandardSchemaV1,
} from '#src/types'

/**
 * Creates a standalone form model from a schema, without mounting any
 * components. The returned instance owns the data and exposes the data API;
 * passing it to a form's `v-model` (or `useForm`) makes the form adopt it.
 * Setup-only.
 *
 * @private
 * @param schema The form schema describing the model's shape. A ref/computed
 *   schema keeps the instance in sync with schema changes.
 * @param model Initial (partial) data cloned over the schema defaults.
 * @param validationSchema A Standard Schema (Zod, Valibot, ArkType, …) run by
 *   `validate()` against the whole model for form-level validation.
 */
export function useModel<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(
  schema: S | Ref<S>,
  model?: DeepPartial<SchemaToModel<S>> & Record<string, any>,
  validationSchema?: Z & MatchesSchemaModel<S, Z>
): ModelInstance<S>

export function useModel(
  schema: FormSchema | Ref<FormSchema>,
  model?: Record<string, any>,
  validationSchema?: StandardSchemaV1
) {
  return getModelModule().make(schema, model, validationSchema)
}
