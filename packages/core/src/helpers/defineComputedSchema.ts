import { computed, type ComputedRef } from 'vue'

import type {
  ArraySchema,
  ExactValidatedSchema,
  FormSchema,
  MatchesSchemaModel,
  ObjectSchema,
  StandardSchemaV1,
} from '#src/types'

import { attachValidationSchema } from './defineSchema'

/**
 * `defineSchema` counterpart for reactive schemas: takes a getter and returns
 * it wrapped in a `computed`, so schemas built from reactive sources stay live
 * without a manual `computed(() => defineSchema({ … }))` wrapper. The same
 * validation and `const`-narrowing apply to the getter's return value.
 *
 * A separate function (instead of a `defineSchema` overload) so invalid schemas
 * keep reporting inline at the offending property — an overloaded
 * `defineSchema` collapses them into an aggregated "no overload matches" error
 * at the call site.
 *
 * The optional Standard Schema second argument works like `defineSchema`'s: it
 * is keyed on the returned computed ref (the getter produces a fresh object per
 * evaluation). Note the Standard Schema itself is static while the form schema
 * can change reactively.
 *
 * @param schema A getter producing the form schema from reactive sources.
 * @param validationSchema Optional Standard Schema validated against the whole
 *   form model, attached to the computed ref for automatic pickup.
 */
export function defineComputedSchema<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(
  schema: () => S,
  validationSchema?: Z & MatchesSchemaModel<S, Z>
): ComputedRef<S>
export function defineComputedSchema(
  schema: () => FormSchema,
  validationSchema?: StandardSchemaV1
) {
  const schemaRef = computed(schema)

  if (validationSchema) {
    attachValidationSchema(schemaRef, validationSchema)
  }

  return schemaRef
}
