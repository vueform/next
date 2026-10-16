```ts
/**
 * Configuration options for the useOutlets composable.
 */
type UseOutletsOptions = {
  /**
   * An optional component or string that overrides the resolved template
   * entirely. When `null`, template resolution is disabled.
   */
  template?: string | Component | null

  /**
   * An optional record of prop-based slot overrides keyed by slot name.
   * Normalized into outlets (HTML strings are sanitized, object components
   * patched with `inheritAttrs: false`).
   */
  slots?: Record<string, ComponentProp> | undefined
}
```
