```ts
/**
 * Type-safe helper for authoring a theme with your own token structure —
 * arbitrary keys are accepted, so use it when you are building a custom visual
 * layer whose stylesheets define their own token vocabulary. The one universal
 * contract it enforces is an explicit `dark` block (pass `{}` to opt out of a
 * dark variant).
 *
 * To author a theme for an adapter's existing token structure, use the
 * `defineTheme` exported from that adapter's `/themes` entry instead — it
 * enforces the adapter's complete key set and registers the token type
 * augmentation.
 *
 * @param theme The theme definition.
 */
function defineTheme<
  T extends { dark: Record<string, string | number> } & Record<string, unknown>,
>(theme: T): T
```
