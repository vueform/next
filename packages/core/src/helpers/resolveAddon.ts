import type { SecurityModule } from '#core/modules/security'
import type { AddonItem } from '#core/types'
import { kebabToPascal } from '#core/utils'

/**
 * A resolved addon value: display text (rendered escaped by the addon
 * component, so it needs no sanitization), or a dynamic component descriptor
 * (`{ component, props }`) for schema addons.
 */
export type ResolvedAddon =
  string | { component: string; props: Record<string, any> } | undefined

/**
 * Modules `resolveAddon` needs from the caller's setup context — gather them
 * via `useLocale()`, `useSecurity()`, and `useExpression()`.
 */
export interface ResolveAddonModules {
  localize: (value: any) => any
  expression: {
    allowed: (scope: string) => boolean
    resolve: (value: string) => any
  }
}

/**
 * Resolves a raw `AddonItem` into a text string (localized and
 * expression-resolved; rendered escaped downstream) or a dynamic component
 * descriptor — the resolution the addon blueprint performs, exposed for layout
 * components that render addons without a dedicated addon component.
 *
 * @private
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
