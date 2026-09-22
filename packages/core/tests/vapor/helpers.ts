import { createVueform, model, pathExpressionAdapter } from '@vueform/core'
import * as components from '@vueform/core/components'
import { en_US } from '@vueform/core/locales'
import * as modules from '@vueform/core/modules'
import * as rules from '@vueform/core/rules'
import {
  createApp,
  createVaporApp,
  nextTick,
  vaporInteropPlugin,
  type App,
  type Component,
} from 'vue'

// Per-key overrides for the shared element classes VfLayout installs —
// applied via the `layoutClasses` config option (mirrors tests/helpers.ts).
const layoutClasses = {
  root: () => 'vf-element',
  rootInline: () => 'vf-inline-element',
  labelGroup: () => 'vf-label-group',
  loading: 'vf-icon vf-icon-loading',
}

/**
 * Mounts a component with the full core Vueform plugin installed: `createApp` +
 * `vaporInteropPlugin` by default, or `createVaporApp` when `vaporApp` is set
 * (requires a vapor-compiled root).
 */
export function mountApp(
  component: Component,
  { vaporApp = false }: { vaporApp?: boolean } = {}
) {
  const el = document.createElement('div')
  document.body.appendChild(el)

  const app: App = vaporApp
    ? (createVaporApp(component as never) as unknown as App)
    : createApp(component)

  app.use(vaporInteropPlugin)
  app.use(
    createVueform({
      locales: { en_US },
      rules,
      modules: { ...modules, model },
      $expression: { adapter: pathExpressionAdapter },
      components,
      layoutClasses,
    } as never)
  )
  app.mount(el)

  return {
    el,
    app,
    unmount() {
      app.unmount()
      el.remove()
    },
  }
}

/**
 * Waits for Vue's reactivity plus queued micro/macrotasks (e.g. async
 * validation).
 */
export async function flush(ms = 10) {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, ms))
  await nextTick()
}

/**
 * Types into a native input the way a user would.
 */
export async function type(input: HTMLInputElement, value: string) {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}
