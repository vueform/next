/**
 * Type-safe helper for authoring a theme with a custom token structure. An
 * explicit `dark` block is required (pass `{}` to opt out of a dark variant).
 * To author a theme for an adapter's existing token structure, use the
 * `defineTheme` exported from that adapter's `/themes` entry instead.
 *
 * @param theme The theme definition.
 */
export function defineTheme<
  T extends { dark: Record<string, string | number> } & Record<string, unknown>,
>(theme: T): T {
  return theme
}
