import { unref, type ComponentPublicInstance, type MaybeRef } from 'vue'

/**
 * A DOM element, a component instance (resolved via its root element), or
 * nothing.
 */
export type MaybeElement =
  HTMLElement | SVGElement | ComponentPublicInstance | null | undefined

/**
 * Returns the root DOM element for a component ref, handling fragment
 * components by falling back to the next sibling. When the resolved element
 * uses `display: contents` (e.g. a tabpanel wrapper), returns its first child
 * element instead, since `getBoundingClientRect` returns all zeros for
 * `display: contents` elements.
 *
 * @param $el A possibly reactive reference to a component or HTML element.
 */
export function rootDomOf($el: MaybeRef<MaybeElement>): HTMLElement | null {
  const el = unref($el)
  let root: HTMLElement | null = null

  if (el instanceof HTMLElement) {
    root = el
  } else {
    const sibling = (el as CharacterData | undefined)?.nextElementSibling
    root = sibling instanceof HTMLElement ? sibling : null
  }

  if (root && getComputedStyle(root).display === 'contents') {
    const child = root.firstElementChild
    return child instanceof HTMLElement ? child : root
  }

  return root
}

/**
 * Checks whether any part of the element is visible within the viewport.
 *
 * @param el The DOM element to check.
 */
export function isInViewport(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return (
    r.top < window.innerHeight &&
    r.bottom > 0 &&
    r.left < window.innerWidth &&
    r.right > 0
  )
}

/**
 * Checks whether the top edge of the element is within the viewport.
 *
 * @param el The DOM element to check.
 */
export function isTopInViewport(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return r.top >= 0 && r.top <= window.innerHeight
}

/**
 * Scrolls the element into view only if its top is not already visible.
 *
 * @param el The DOM element to scroll into view.
 * @param options Options passed to `scrollIntoView`.
 */
export function scrollIntoViewIfNeeded(
  el: HTMLElement | null,
  options?: ScrollIntoViewOptions
) {
  if (!el || isTopInViewport(el)) return
  el.scrollIntoView(options)
}

/**
 * Scrolls a Vueform element's root DOM node into view if needed.
 *
 * @param el$ The Vueform element context.
 * @param options Options passed to `scrollIntoView`.
 */
export function scrollElementIntoView(
  el$: any,
  options?: ScrollIntoViewOptions
) {
  scrollIntoViewIfNeeded(rootDomOf(el$?.$el) as HTMLElement | null, options)
}

/**
 * Recursively finds the first invalid element in a collection, descending into
 * nested children.
 *
 * @param elements An iterable of element contexts to search.
 */
export function findFirstInvalidElement(
  elements: Iterable<any>
): any | undefined {
  const find = (items: any[]): any | undefined => {
    for (const el$ of items) {
      if (!el$.invalid) continue
      if ('statefulChildren$' in el$ && el$.statefulChildren$?.length) {
        const nested = find(el$.statefulChildren$)
        if (nested) return nested
      }
      return el$
    }
  }

  return find([...elements])
}
