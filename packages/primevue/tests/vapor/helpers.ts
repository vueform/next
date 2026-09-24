import { createVueform } from '@vueform/core'
import { en_US } from '@vueform/core/locales'
import * as modules from '@vueform/core/modules'
import * as rules from '@vueform/core/rules'
import PrimeVue from 'primevue/config'
import {
  createApp,
  createVaporApp,
  nextTick,
  vaporInteropPlugin,
  type App,
  type Component,
} from 'vue'
import * as components from '@/components'
import defaultConfig from '@/config'
import { vTooltip } from '@/directives'
import { theme } from '@/themes'

/**
 * Mounts a component with PrimeVue + the full Vueform primevue plugin stack:
 * `createApp` + `vaporInteropPlugin` by default, or `createVaporApp` when
 * `vaporApp` is set (requires a vapor-compiled root). PrimeVue stays VDOM and
 * is hosted under vapor interop when the Vueform shells are vapor-compiled.
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
  app.directive('tooltip', vTooltip as any)
  app.use(PrimeVue, { unstyled: true })
  app.use(
    createVueform({
      locales: { en_US },
      rules,
      modules,
      components,
      defaults: defaultConfig.defaults,
      theme,
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
 *
 * @param ms Extra macrotask delay in milliseconds.
 */
export async function flush(ms = 10) {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, ms))
  await nextTick()
}

/**
 * Types into a native input the way a user would.
 *
 * @param input The input element to type into.
 * @param value The value to type.
 */
export async function type(input: HTMLInputElement, value: string) {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}
