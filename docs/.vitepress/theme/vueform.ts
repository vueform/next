import { fetchHttpAdapter, nativeDateAdapter } from '@vueform/core'
import expression from '@vueform/expr-eval'
import { en_US } from '@vueform/ui/locales'
// Only the active adapter is bundled. `virtual:vf-active-adapter` is aliased
// in config.mts to `adapters/${VF_ADAPTER}/index.ts` based on the build
// target, so inactive adapters (their JS, theme, and CSS) never enter the
// build graph.
import activeAdapter from 'virtual:vf-active-adapter'
import type { App } from 'vue'

/**
 * Installs the active adapter and a Vueform instance configured for the docs'
 * live examples.
 */
export function installVueform(app: App) {
  const entry = activeAdapter

  entry.install?.(app)

  app.use(
    entry.createVueform({
      locales: { en_US },
      $date: { adapter: nativeDateAdapter },
      $http: { adapter: fetchHttpAdapter },
      components: entry.components,
      rules: entry.rules,
      modules: entry.modules,
      darkMode: '.dark',
      plugins: [expression()],
      icon: entry.icon ?? entry.defaultConfig.icon,
      ...(entry.theme ? { theme: entry.theme } : {}),
    })
  )
}
