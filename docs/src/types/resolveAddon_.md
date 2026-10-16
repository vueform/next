```ts
/**
 * Resolves a raw `AddonItem` into a localized text string or a dynamic
 * component descriptor.
 *
 * @param addon The raw addon value to resolve.
 * @param options The `$security` module slice used to allowlist and sanitize
 *   schema addon components.
 */
function resolveAddon(
  addon: AddonItem | undefined,
  { localize, expression }: ResolveAddonModules,
  {
    $security,
  }: {
    $security: Pick<SecurityModule, 'allowsComponent' | 'sanitizeProps'>
  }
): ResolvedAddon
```
