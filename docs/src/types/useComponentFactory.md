```ts
/**
 * A factory for components built from schema data. Resolves its modules once at
 * the setup boundary; the returned makers are plain closures, callable later
 * (inside computeds, render paths).
 */
function useComponentFactory(): {
  /**
   * Resolves the component a schema entry renders as — the one resolution every
   * schema placement shares (form entries, list prototypes, grid cells, matrix
   * columns): an explicit `component` resolves only through
   * `$security.allowComponents` (component objects/functions are developer code
   * and pass as-is); a rejected or absent one falls back to the `Vf*` element
   * derived from the type. Returns `undefined` when neither resolves — what
   * that means (skip, warn, placeholder) is the caller's decision.
   *
   * @param schema The schema entry (its `component` key is consulted).
   * @param type The element type deriving the `Vf*` fallback; defaults to the
   *   schema's own `type`.
   */
  makeFromSchema: (
    schema: Record<string, any> | undefined,
    type?: string | undefined
  ) => string | Component | undefined

  /**
   * Creates the functional component rendering one schema string as slot/cell
   * content, applying the security pipeline in the only safe order: **resolve
   * expressions first, then sanitize** — the sanitizer must see the final
   * bytes, never a template whose placeholders are later replaced with
   * untrusted form data.
   *
   * Plain text (no markup) renders as a bare text node. HTML renders only when
   * `allowsHtml(area)` grants the area, always through `sanitizeHtml` (the
   * engine, or its fallback: raw + dev warning in development, empty in
   * production); otherwise the string renders escaped, tags visible.
   *
   * HTML renders as a **static vnode**: the sanitized string is parsed by the
   * platform's own `innerHTML` rules and its nodes inserted directly — no
   * wrapper element, single- and multi-root markup alike, and `<script>`
   * elements stay inert exactly as the HTML spec keeps them in any `innerHTML`
   * sink. The vnode is keyed by its content, so a change (e.g. a re-resolved
   * expression) replaces the nodes instead of patching a "static" vnode, which
   * Vue would otherwise never update.
   *
   * The component is marked raw — it holds no reactive state of its own.
   *
   * @param raw The schema string to render.
   * @param options The rendering options (HTML area, expression key).
   */
  makeFromString: (
    raw: string,
    options: FromStringOptions
  ) => FunctionalComponent
}
```
