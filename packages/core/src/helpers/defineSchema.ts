import { isRef, toRaw } from 'vue'

import type {
  ArraySchema,
  ExactValidatedSchema,
  FormSchema,
  MatchesSchemaModel,
  ObjectSchema,
  StandardSchemaV1,
} from '#src/types'

// Side-table: never mutates the user's schema, GC'd with it. Reactive schemas
// key by the computed ref (its getter returns a fresh object each time).
const validationSchemas = new WeakMap<object, StandardSchemaV1>()

/**
 * Attaches a Standard Schema to a schema object or ref for
 * `getAttachedValidationSchema` to find.
 *
 * @private
 * @param schema The schema object or ref to key the Standard Schema by.
 * @param validationSchema The Standard Schema to attach.
 */
export function attachValidationSchema(
  schema: object,
  validationSchema: StandardSchemaV1
) {
  validationSchemas.set(schema, validationSchema)
}

/**
 * Returns the Standard Schema attached to a schema (or schema ref) via
 * `defineSchema` / `defineComputedSchema`'s second argument, if any.
 *
 * @private
 * @param schema The schema object or ref to look up.
 */
export function getAttachedValidationSchema(
  schema: unknown
): StandardSchemaV1 | undefined {
  if (typeof schema !== 'object' || schema === null) return undefined

  const direct = validationSchemas.get(toRaw(schema))
  if (direct || !isRef(schema)) return direct

  const unwrapped = schema.value
  return typeof unwrapped === 'object' && unwrapped !== null
    ? validationSchemas.get(toRaw(unwrapped))
    : undefined
}

/**
 * Identity helper that validates and `const`-narrows a form schema so it can
 * drive type-level features. Each entry is validated against its registered
 * element's props, and an optional Standard Schema (Zod, Valibot, ArkType, …)
 * can be passed for form-level validation.
 *
 * @param schema The form schema in object or array notation.
 * @param validationSchema Optional Standard Schema validated against the whole
 *   form model, attached to the schema for automatic pickup.
 */
export function defineSchema<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(schema: S, validationSchema?: Z & MatchesSchemaModel<S, Z>): S
export function defineSchema(
  schema: FormSchema,
  validationSchema?: StandardSchemaV1
) {
  if (validationSchema) {
    attachValidationSchema(schema, validationSchema)
  }

  return schema
}
