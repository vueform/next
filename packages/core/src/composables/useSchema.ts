import { computed, unref, type Ref } from 'vue'
import { useComponentFactory, useSecurity } from '~/composables'
import type { FormSchema, NamedElementSchema } from '~/types'
import { typedEntries, warn, isDev } from '~/utils'

/**
 * Resolves a form schema definition into a normalized array of named element
 * schemas with their component names.
 *
 * @param schema The form schema to resolve, either as an array or keyed object.
 * @private
 */
export function useSchema(schema: Ref<FormSchema | undefined>) {
  const { sanitizeProps } = useSecurity()
  const { makeFromSchema } = useComponentFactory()

  return computed(() => {
    const s = unref(schema)
    if (!s) return []
    let baseSchema: NamedElementSchema[] = []

    if (Array.isArray(s)) {
      baseSchema = s
    } else if (typeof s === 'object') {
      baseSchema = []
      for (const [name, schema] of typedEntries(s)) {
        baseSchema.push({ ...(schema as any), name })
      }
    }

    const resolved: { props: NamedElementSchema; component: any }[] = []

    for (const rawProps of baseSchema) {
      const props = sanitizeProps(rawProps)

      const component = makeFromSchema(props)

      if (!component) {
        if (isDev()) {
          warn(
            `schema entry \`${String((props as any).name)}\` has no usable \`component\` and no \`type\`; the entry is skipped.`
          )
        }
        continue
      }

      resolved.push({ props, component })
    }

    return resolved
  })
}
