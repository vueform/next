import { onUnmounted, unref, watch, type App } from 'vue'

import type { VueformInstance } from '#src/helpers'
import { isDev } from '#src/utils'

import { refreshInspector, setupInspector } from './inspector'
import { noopDevtools } from './noop'
import { registerForm, unregisterForm } from './registry'
import type { DevtoolsModule } from './types'

/**
 * Form context properties watched (deeply) so the inspector panels refresh when
 * a tracked form's data or state changes.
 */
const WATCHED_FORM_STATE = [
  'model',
  'payload',
  'initialModel',
  'dirty',
  'invalid',
  'validated',
  'completed',
  'submitting',
  'pending',
  'debouncing',
  'loading',
  'empty',
  'busy',
  'errors',
  'messages',
  'language',
  'result',
  'response',
  'submits',
] as const

/**
 * Creates a devtools instance from the given app config (`$devtools` is
 * currently reserved; the top-level `devtools: false` option opts out).
 * Development-only by design: in production builds, and when opted out, the
 * inert `noopDevtools` surface is returned instead — nothing is tracked and no
 * DevTools plugin is registered, so the module can stay registered
 * unconditionally.
 *
 * When active, a `VfForm` plugin is added that registers every mounted form
 * with the inspector registry, refreshes the inspector on form data/state
 * changes, and unregisters the form on unmount. The inspector itself is set up
 * per app when Vueform is installed.
 *
 * @param vueform The Vueform instance; its config (`$devtools` is reserved,
 *   `devtools` opts out) and plugin registry.
 */
export function createDevtools(vueform: VueformInstance): DevtoolsModule {
  if (!isDev() || vueform.config.devtools === false) {
    return noopDevtools
  }

  // Created at `createVueform()`, before install — the plugin is in place
  // before any form can mount.
  vueform.config.plugins.push({
    name: 'devtools',
    apply: 'VfForm',
    extend(_props: any, api: any) {
      const uid = String(unref(api.uid))

      registerForm(uid, api)

      watch(
        () => WATCHED_FORM_STATE.map((key) => unref(api[key])),
        () => refreshInspector(),
        { deep: true, flush: 'post' }
      )

      onUnmounted(() => unregisterForm(uid))
    },
  })

  /**
   * The apps the inspector has been set up for — an instance may serve several
   * apps, each getting its own DevTools plugin registration exactly once.
   */
  const setupApps = new WeakSet<App>()

  return {
    registerForm,
    unregisterForm,
    refreshInspector,
    setupInspector: (app: App) => {
      if (setupApps.has(app)) return
      setupApps.add(app)

      setupInspector(app)
    },
  }
}
