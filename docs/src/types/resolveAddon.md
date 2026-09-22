```ts
/**
 * Resolves a raw `AddonItem` into a text string (localized and
 * expression-resolved; rendered escaped downstream) or a dynamic component
 * descriptor — the resolution the addon blueprint performs, exposed for layout
 * components that render addons without a dedicated addon component.
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
