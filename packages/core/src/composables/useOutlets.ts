import {
  computed,
  h,
  markRaw,
  toRaw,
  useSlots,
  type Component,
  type ComputedRef,
  type FunctionalComponent,
} from 'vue'

import { useComponentFactory, useSecurity } from '#core/composables'
import type { ComponentProp } from '#core/types'
import {
  getGenericInstance,
  isVaporInstance,
  toCamelCase,
  toVdomRenderableSlot,
} from '#core/utils'

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

/**
 * Return type for the useOutlets composable.
 */
type UseOutletsReturn = {
  /**
   * The merged and normalized outlets map. Includes a resolved `template` entry
   * from the template prop or `slots.template`.
   */
  outlets: ComputedRef<Record<string, any>>
}

/**
 * Normalized copies of object slot components (`inheritAttrs` patched to
 * `false`), keyed by the raw original. Reusing the copy keeps the vnode type
 * stable across outlet re-evaluations — a fresh copy per evaluation (e.g. a
 * computed schema recomputing) would remount the slot content.
 */
const normalizedSlotComponents = new WeakMap<object, Component>()

/**
 * Cached camelizing shims for prop-based slot components, keyed by the raw
 * entry — reusing the shim keeps the vnode type stable across outlet
 * re-evaluations (a fresh wrapper per evaluation would remount the slot).
 */
const camelizedSlotComponents = new WeakMap<object, Component>()

/**
 * Camelizes hyphenated payload keys (`checkbox-name` → `checkboxName`) so
 * prop-based slot components receive the same key spelling as inline template
 * slots (whose payload the compiler camelizes) and as the declared slot payload
 * types. `data-*` / `aria-*` stay verbatim — they are DOM attribute names,
 * never payload members.
 */
function camelizePayloadAttrs(attrs: Record<string, unknown>) {
  const out: Record<string, unknown> = {}

  for (const key in attrs) {
    out[
      key.includes('-') && !key.startsWith('data-') && !key.startsWith('aria-')
        ? toCamelCase(key)
        : key
    ] = attrs[key]
  }

  return out
}

/**
 * Wraps a prop-based slot component in a cached functional shim that camelizes
 * the outlet's payload keys before they reach it. Without the shim, components
 * that don't declare props (functional ones in particular) receive the keys
 * exactly as the host template spells them (kebab-case), while declared props
 * are camelize-matched by Vue — the shim makes both consumer classes see the
 * camelCase keys the slot payload types declare.
 */
function toCamelizedSlotComponent(raw: object, target: Component): Component {
  let shim = camelizedSlotComponents.get(raw)

  if (!shim) {
    const fc: FunctionalComponent = (_props, { attrs, slots }) =>
      h(target, camelizePayloadAttrs(attrs), slots)
    fc.inheritAttrs = false
    shim = markRaw(fc)
    camelizedSlotComponents.set(raw, shim)
  }

  return shim
}

/**
 * Whether a slot string is shaped like a component name — PascalCase
 * (`MyBadge`) or kebab-case (`my-badge`). Only shaped strings consult the
 * `allowsComponent` gate at all: everything else is content by construction, so
 * it can never trigger the gate's unlisted-name warning.
 */
const COMPONENT_NAME_RE =
  /^(?:[A-Z][A-Za-z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)+)$/

/**
 * Builds the standard outlets map every Vueform component exposes as
 * `context.outlets`: inline Vue template slots merged with normalized
 * prop-based slot overrides, plus the component template resolved into
 * `outlets.template`.
 *
 * Inline slots are included as-is (wrapped into VDOM-renderable slot functions
 * on vapor, where compiled slots return DOM blocks that VDOM consumers like
 * `<component :is>` can't render). Kebab-case slot names are normalized to
 * camelCase. Inline slots take priority over prop-based ones — the same order
 * the components' render pattern produces (`<slot name="x">` renders the inline
 * content and only falls back to the prop-based outlet), so `outlets.x` always
 * holds what actually renders.
 *
 * Slot overrides are normalized: a string entry listed in
 * `$security.allowComponents` is passed through for Vue to resolve as that
 * component; every other string is content — plain text renders escaped, and
 * HTML renders only through `$security.allowHtml` with the sanitizer applied
 * after expression resolution; object components are unwrapped via `toRaw` and
 * marked raw (so schemas held in refs or stores work without user-side
 * `markRaw`), and ones without an explicit `inheritAttrs: true` are patched to
 * `false` — through a per-original cache so the patched copy keeps its identity
 * across re-evaluations.
 *
 * Template resolution order (mirroring the documented component resolution):
 * inline `#template` slot, then the `template` prop (which config `defaults`
 * and presets feed like any other prop), then `slots.template`. A string
 * `template` prop goes through the same component allowlist.
 *
 * Called by `useBlueprint` for every component; blueprints only call it
 * directly to post-process the result (e.g. the layout blueprint resolving the
 * element's `layout` prop into `template`).
 *
 * @private
 * @param options Outlet resolution options.
 */
export function useOutlets(options: UseOutletsOptions): UseOutletsReturn {
  const $security = useSecurity()
  const { makeFromString } = useComponentFactory()
  const { allowsComponent } = $security
  const vueSlots = useSlots()
  const instance = getGenericInstance()
  const isVapor = isVaporInstance(instance)

  /**
   * Whether a name resolves to an app-registered component (exact, camelized,
   * or capitalized — Vue's own resolution order). Shaped slot strings only pass
   * through as components when the name actually exists: without this, a
   * permissive gate (the module-less surface, or a listed-but-unregistered
   * name) would turn one-word text slots like `'Hello'` into unresolvable
   * elements and swallow the text.
   */
  const isRegisteredComponent = (name: string): boolean => {
    const components = (instance as any)?.appContext?.components ?? {}

    if (components[name]) return true

    const camel = toCamelCase(name)

    return !!(
      components[camel] ||
      components[camel.charAt(0).toUpperCase() + camel.slice(1)]
    )
  }

  /**
   * The merged and normalized outlets map. Includes a resolved `template` entry
   * from the template prop or `slots.template`.
   */
  const outlets = computed(() => {
    const outletsMap: Record<string, any> = {}

    for (const key in options.slots) {
      let slot = options.slots[key]

      if (typeof slot === 'string') {
        // Only strings shaped like a component name AND actually registered
        // consult the `$security.allowComponents` gate (whose miss warns once
        // per name — so the warning only ever names registered components,
        // the actionable case); everything else is content by construction.
        // A shaped, registered, allowed string is passed through for Vue to
        // resolve; plain text always renders, and HTML rendering is
        // the string-content component's decision (`$security.allowHtml`, with
        // sanitization applied at the sink).
        if (
          !(
            COMPONENT_NAME_RE.test(slot) &&
            isRegisteredComponent(slot) &&
            allowsComponent(slot)
          )
        ) {
          slot = makeFromString(slot, {
            htmlArea: 'slots',
            exprKey: 'slots',
          })
        }
      } else if (slot && typeof slot === 'object') {
        // Schemas stored in a `ref()` or a store arrive with their components
        // wrapped in reactive proxies — unwrap before use so vnode types stay
        // stable and Vue's "component made reactive" warning can't trigger.
        // Users never need `markRaw` on their side.
        const raw = toRaw(slot) as Component & { inheritAttrs?: boolean }

        if (raw.inheritAttrs === true) {
          // Explicit fallthrough opt-in: left untouched (payload keys arrive
          // exactly as the host template spells them).
          slot = markRaw(raw)
        } else {
          let normalized = normalizedSlotComponents.get(raw)
          if (!normalized) {
            normalized = markRaw({ ...raw, inheritAttrs: false } as Component)
            normalizedSlotComponents.set(raw, normalized)
          }
          slot = toCamelizedSlotComponent(raw, normalized)
        }
      } else if (typeof slot === 'function') {
        // Function components declare no props, so without the shim they'd
        // receive the payload keys verbatim (kebab-case).
        slot = toCamelizedSlotComponent(slot, slot as Component)
      }

      outletsMap[key.includes('-') ? toCamelCase(key) : key] = slot
    }

    if (options.template === null) {
      outletsMap.template = null
    } else {
      // A string `template` prop is a registered component name and comes
      // from the same (possibly untrusted) place as the schema, so it goes
      // through the allowlist too.
      const propTemplate =
        typeof options.template === 'string' &&
        !allowsComponent(options.template)
          ? undefined
          : options.template

      const resolvedTemplate = propTemplate || outletsMap.template
      outletsMap.template =
        resolvedTemplate && typeof resolvedTemplate !== 'string'
          ? markRaw(toRaw(resolvedTemplate))
          : (resolvedTemplate ?? null)
    }

    // Inline slots last: they win over prop-based entries (`template`
    // included), so the map mirrors what the render pattern shows.
    for (const key in vueSlots) {
      const slot = vueSlots[key]
      outletsMap[key.includes('-') ? toCamelCase(key) : key] =
        isVapor && typeof slot === 'function'
          ? toVdomRenderableSlot(key, slot)
          : slot
    }

    return outletsMap
  })

  return { outlets }
}
