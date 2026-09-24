import {
  createStaticVNode,
  markRaw,
  type Component,
  type FunctionalComponent,
} from 'vue'
import type { SecurityHtmlArea } from '@core/modules/security'
import { containsHtml, kebabToPascal } from '@core/utils'
import { useExpression } from './useExpression'
import { useSecurity } from './useSecurity'

/**
 * Options for creating a component from a schema string.
 */
export type FromStringOptions = {
  /**
   * The `$security.allowHtml` area the string belongs to.
   */
  htmlArea: SecurityHtmlArea

  /**
   * The expression allow-list key this string may resolve under — `{...}`
   * templates resolve when the key is allowed by the expression module (e.g.
   * `'slots'`). Omitted: the string never resolves expressions.
   */
  exprKey?: string
}

/**
 * Counts the top-level DOM nodes an HTML string parses into — the node count a
 * static vnode needs for hydration. Deterministic from the string, so the
 * client computes the same count when hydrating server-rendered markup; on the
 * server the count is unused (the renderer emits the string as-is).
 */
function countTopLevelNodes(html: string): number {
  if (typeof document === 'undefined') return 1

  const template = document.createElement('template')
  template.innerHTML = html

  return template.content.childNodes.length
}

/**
 * A factory for components built from schema data. Resolves its modules once at
 * the setup boundary; the returned makers are plain closures, callable later
 * (inside computeds, render paths).
 *
 * @private
 */
export function useComponentFactory() {
  const { allowsComponent, allowsHtml, sanitizeHtml } = useSecurity()
  const { allowed, resolve } = useExpression()

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
  const makeFromString = (
    raw: string,
    options: FromStringOptions
  ): FunctionalComponent => {
    const { htmlArea, exprKey } = options

    const fc: FunctionalComponent = () => {
      const content = exprKey && allowed(exprKey) ? resolve(raw) : raw

      if (!containsHtml(content)) {
        return content
      }

      if (!allowsHtml(htmlArea)) {
        // Escaped fallback: the string stays visible as text (tags literal),
        // so a missing `allowHtml` entry is diagnosable rather than a silent
        // blank.
        return content
      }

      const safe = sanitizeHtml(content)

      if (!safe) {
        return ''
      }

      const vnode = createStaticVNode(safe, countTopLevelNodes(safe))
      vnode.key = safe

      return vnode
    }

    fc.inheritAttrs = false

    return markRaw(fc)
  }

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
  const makeFromSchema = (
    schema: Record<string, any> | undefined,
    type: string | undefined = schema?.type
  ): string | Component | undefined => {
    const explicit = schema?.component

    if (
      explicit &&
      (typeof explicit !== 'string' || allowsComponent(explicit))
    ) {
      return explicit
    }

    return type != null ? `Vf${kebabToPascal(type)}` : undefined
  }

  return { makeFromSchema, makeFromString }
}
