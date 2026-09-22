// In vapor mode the vitest config aliases every `@vueform/ui/...` import to
// its `@vueform/ui/vapor/...` twin, and `vue` always resolves to the 3.6
// runtime-with-vapor build — so this single module serves both modes.
import { createVueform } from '@vueform/ui'
import * as components from '@vueform/ui/components'
import { en_US } from '@vueform/ui/locales'
import * as modules from '@vueform/ui/modules'
import * as rules from '@vueform/ui/rules'
import { origin as theme } from '@vueform/ui/themes'
import * as Vue from 'vue'
import { createApp, shallowReactive, type App } from 'vue'

import BenchRoot from './BenchRoot.vue'
import type { MountOptions, MountResult } from './case'

declare const __BENCH_VAPOR__: boolean

/**
 * The active rendering mode.
 */
export const MODE = __BENCH_VAPOR__ ? 'vapor' : 'vdom'

// Render every benchmarked form in dark mode (paired with `darkMode: '.dark'`
// in createVueform below).
document.documentElement.classList.add('dark')

/**
 * Mounts a VfForm with the given props in the active mode and returns a handle
 * exposing the container, the form context and reactive prop updates.
 *
 * @param props Props bound to VfForm (e.g. `{ schema }`).
 * @param options Mount options (e.g. `{ vmodel: true }` for a real v-model).
 */
export async function mount(
  props: Record<string, any>,
  options?: MountOptions
): Promise<MountResult> {
  const vmodel = !!options?.vmodel
  const state = shallowReactive({
    props,
    vmodel,
    model: vmodel ? (props.modelValue ?? {}) : undefined,
  })
  let form$: any = null

  const container = document.createElement('div')
  document.body.appendChild(container)

  const app: App = __BENCH_VAPOR__
    ? ((Vue as any).createVaporApp(BenchRoot as never) as App)
    : createApp(BenchRoot)

  app.provide('bench$', {
    state,
    setForm: (value: any) => {
      form$ = value
    },
  })

  app.use(
    createVueform({
      locales: { en_US },
      theme,
      components,
      modules,
      rules,
      darkMode: '.dark',
    })
  )

  app.mount(container)

  return {
    container,
    app,
    setProps(next: Record<string, any>) {
      state.props = next
    },
    get model() {
      return state.model
    },
    setModel(value: any) {
      state.model = value
    },
    get form$() {
      return form$
    },
    unmount() {
      app.unmount()
      container.remove()
    },
  }
}
