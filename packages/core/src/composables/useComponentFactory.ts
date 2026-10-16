import {
  createStaticVNode,
  markRaw,
  type Component,
  type FunctionalComponent,
} from 'vue'

import type { SecurityHtmlArea } from '#src/modules/security'
import { containsHtml, kebabToPascal } from '#src/utils'

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
   * The expression allow-list key this string may resolve under. Omitted: the
   * string never resolves expressions.
   */
  exprKey?: string
}

/**
 * Counts the top-level DOM nodes an HTML string parses into.
 */
function countTopLevelNodes(html: string): number {
  if (typeof document === 'undefined') return 1

  const template = document.createElement('template')
  template.innerHTML = html

  return template.content.childNodes.length
}

/**
 * A factory for components built from schema data. Setup-only; the returned
 * makers are callable anywhere later.
 *
 * @private
 */
export function useComponentFactory() {
  const { allowsComponent, allowsHtml, sanitizeHtml } = useSecurity()
  const { allowed, resolve } = useExpression()

  /**
   * Creates a functional component rendering one schema string as slot/cell
   * content, resolving expressions and sanitizing HTML. Plain text renders as a
   * bare text node; HTML renders only when the area allows it.
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
   * Resolves the component a schema entry renders as: an explicit `component`
   * when allowed, otherwise the `Vf*` element derived from the type. Returns
   * `undefined` when neither resolves.
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
