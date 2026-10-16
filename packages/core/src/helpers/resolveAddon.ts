import type { SecurityModule } from '#src/modules/security'
import type { AddonItem } from '#src/types'
import { kebabToPascal } from '#src/utils'

/**
 * A resolved addon value: display text, or a dynamic component descriptor for
 * schema addons.
 */
export type ResolvedAddon =
  | string
  | { component: string; props: Record<string, any> }
  | undefined

/**
 * Modules `resolveAddon` needs from the caller's setup context.
 */
export interface ResolveAddonModules {
  localize: (value: any) => any
  expression: {
    allowed: (scope: string) => boolean
    resolve: (value: string) => any
  }
}

/**
 * Resolves a raw `AddonItem` into a localized text string or a dynamic
 * component descriptor.
 *
 * @private
 * @param addon The raw addon value to resolve.
 * @param options The `$security` module slice used to allowlist and sanitize
 *   schema addon components.
 */
export function resolveAddon(
  addon: AddonItem | undefined,
  { localize, expression }: ResolveAddonModules,
  {
    $security,
  }: {
    $security: Pick<SecurityModule, 'allowsComponent' | 'sanitizeProps'>
  }
): ResolvedAddon {
  if (!addon) return

  if (typeof addon === 'object' && 'type' in addon) {
    const schema = addon
    // An explicit `component` name string is schema data and goes through the
    // `$security.allowComponents` allowlist like every other name string; the
    // `Vf*` name derived from `type` is the exempt element vocabulary.
    const explicit = (schema as any).component
    const name =
      typeof explicit === 'string' && $security.allowsComponent(explicit)
        ? explicit
        : `Vf${kebabToPascal(String(schema.type))}`

    return { component: name, props: $security.sanitizeProps(schema) }
  }

  let value = localize(
    typeof addon === 'string'
      ? addon
      : typeof addon === 'object'
        ? addon
        : undefined
  )

  if (value && expression.allowed('addon')) {
    value = expression.resolve(value)
  }

  return value ? String(value) : undefined
}
