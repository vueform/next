import type { FormSchema } from '~/types'

/**
 * Normalizes a form schema (array or object notation) into `[name, props]`
 * entries, mirroring `useSchema`'s resolution without component naming.
 *
 * @param schema The form schema in either notation.
 */
export function schemaEntries(
  schema: FormSchema | undefined
): [string, Record<string, any>][] {
  if (!schema) return []

  if (Array.isArray(schema)) {
    return (schema as readonly Record<string, any>[]).map((entry) => [
      String(entry.name),
      entry,
    ])
  }

  return Object.entries(schema as Record<string, any>).map(([name, entry]) => [
    name,
    { ...entry, name },
  ])
}
