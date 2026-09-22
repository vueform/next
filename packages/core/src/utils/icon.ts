import type { VueformConfig } from '~/helpers'

/**
 * Resolves an icon identifier into a CSS class string. `$`-prefixed names are
 * treated as semantic icons and mapped through the config-level `icons` map
 * before being passed to the adapter's `icon` resolver, so built-in controls
 * (e.g. list add/remove/sort buttons) render each adapter's canonical icons.
 *
 * @param config The resolved Vueform configuration.
 * @param name The icon identifier or `$`-prefixed semantic icon name.
 */
export function resolveIcon(
  config: Pick<VueformConfig, 'icon' | 'icons'>,
  name: string
): string {
  if (name.startsWith('$')) {
    const key = name.slice(1)
    name = config.icons?.[key] ?? key
  }

  return config.icon(name)
}
