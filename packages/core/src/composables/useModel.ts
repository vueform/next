import { getModelModule, type ModelInstance } from '~/modules/model'
import type {
  ArraySchema,
  DeepPartial,
  ExactValidatedSchema,
  FormSchema,
  MatchesSchemaModel,
  ObjectSchema,
  SchemaToModel,
  StandardSchemaV1,
} from '~/types'
import type { Ref } from 'vue'

/**
 * Creates a standalone form model from a schema: the full data shape is built
 * up front from the elements' model metadata (defaults, null values,
 * translatable expansion), without mounting any components.
 *
 * Resolves the Vueform instance of the calling component, so it is setup-only.
 * Outside a component — stores, utilities, server code, module scope — use your
 * instance directly: `vueform.useModel(schema, data)`.
 *
 * The returned instance owns the data and exposes the familiar data API
 * (`update` / `load` / `clear` / `reset` / `clean`, `dirty` / `empty`,
 * path-based `get` / `set`, `toJSON` / `toFormData`). Passing it to a form's
 * `v-model` (or `useForm`) makes the form adopt it — the same store is shared
 * without cloning, and `submit()` becomes available.
 *
 * ```ts
 * const model$ = useModel(schema, { name: 'John' })
 *
 * model$.model.name // 'John'
 * model$.set('email', 'john@example.com')
 * model$.dirty // true
 * ```
 *
 * @param schema The form schema describing the model's shape. When a
 *   ref/computed is passed (e.g. from `defineComputedSchema`), the instance
 *   follows schema changes: added elements seed their defaults, removed
 *   elements drop their data, validation/conditions/expressions re-wire —
 *   existing values and expression untrack state survive.
 * @param model Initial (partial) data cloned over the schema defaults. A Vue
 *   ref is rejected (dev warn, seed ignored) — pass a plain or reactive object.
 *   Later mutations of the seed are ignored.
 * @param validationSchema A Standard Schema (Zod, Valibot, ArkType, …) run by
 *   `validate()` against the whole model for form-level (cross-field)
 *   validation. Overrides a Standard Schema attached via `defineSchema`'s
 *   second argument.
 * @private
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
