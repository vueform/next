import Tooltip from 'primevue/tooltip'
import { watchEffect } from 'vue'

declare const __VUEFORM_VAPOR__: boolean | undefined

/**
 * Minimal `$primevue` stub so PrimeVue's Tooltip ObjectDirective can read
 * `instance.$primevue.config.zIndex.tooltip` under vapor (where
 * `getCurrentInstance()` / the VDOM proxy are unavailable).
 */
const vaporPrimevueInstance = {
  $primevue: {
    config: {
      zIndex: {
        tooltip: 1100,
      },
    },
  },
}

type TooltipBinding = {
  value: any
  oldValue: any
  arg: string | undefined
  modifiers: Record<string, boolean>
  instance: typeof vaporPrimevueInstance
  dir: typeof Tooltip
}

function createBinding(
  value: any,
  argument: string | undefined,
  modifiers: Record<string, boolean> | undefined,
  oldValue?: any
): TooltipBinding {
  return {
    value,
    oldValue,
    arg: argument,
    modifiers: modifiers ?? {},
    instance: vaporPrimevueInstance,
    dir: Tooltip,
  }
}

/**
 * Vapor-compatible PrimeVue Tooltip directive. Vapor custom directives are
 * functions `(el, valueGetter, arg, modifiers) => cleanup`, while PrimeVue
 * ships a VDOM ObjectDirective — this adapter bridges the two.
 *
 * @param el The host DOM element (or vapor component root element).
 * @param value Reactive getter for the directive binding value.
 * @param argument Directive argument string.
 * @param modifiers Directive modifiers map.
 */
function vaporTooltip(
  el: Element,
  value?: () => any,
  argument?: string,
  modifiers?: Record<string, boolean>
) {
  let oldValue: any
  let mounted = false

  // Vapor has no VNodes; BaseDirective reads config from binding.instance.$primevue first.
  const vnode = undefined as any

  const stop = watchEffect(() => {
    const nextValue = value?.()
    const binding = createBinding(nextValue, argument, modifiers, oldValue)
    const host = el as HTMLElement
    if (!mounted) {
      // Mirror VDOM directive lifecycle so BaseDirective.extend hooks run.
      Tooltip.created?.(host, binding as any, vnode, null)
      Tooltip.beforeMount?.(host, binding as any, vnode, null)
      Tooltip.mounted?.(host, binding as any, vnode, null)
      mounted = true
    } else {
      Tooltip.beforeUpdate?.(host, binding as any, vnode, vnode)
      Tooltip.updated?.(host, binding as any, vnode, vnode)
    }
    oldValue = nextValue
  })

  return () => {
    stop()
    if (mounted) {
      const binding = createBinding(oldValue, argument, modifiers) as any
      const host = el as HTMLElement
      Tooltip.beforeUnmount?.(host, binding, vnode, null)
      Tooltip.unmounted?.(host, binding, vnode, null)
    }
  }
}

/**
 * Tooltip directive for Vueform PrimeVue components. Resolves to PrimeVue's
 * VDOM ObjectDirective in the main dist, or a vapor function directive in the
 * vapor dist / vapor playground / vapor tests (`__VUEFORM_VAPOR__`).
 */
export const vTooltip =
  typeof __VUEFORM_VAPOR__ !== 'undefined' && __VUEFORM_VAPOR__
    ? vaporTooltip
    : Tooltip
