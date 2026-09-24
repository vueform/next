import type { VueformInstance } from '@core/helpers'
import { getRouterModule, type RouterHistory } from '@core/modules/router'
import type { MaybeRef } from 'vue'

/**
 * Creates a history handler over the router module (the module's `make()`):
 * push/back navigation for multi-step forms plus a listener for external
 * navigation (browser back, route change). Without the `router` module it is
 * the inert surface — records nothing, navigates nowhere.
 *
 * Setup-only when called without `vueform` — it resolves the calling
 * component's instance. Pass your `createVueform()` instance to use it anywhere
 * else.
 *
 * @private
 * @param active Whether history tracking is enabled.
 * @param onNavigate Callback invoked when an external navigation occurs.
 * @param vueform The Vueform instance to resolve from. Required outside a
 *   component context.
 */
export function useRouter(
  active: MaybeRef<boolean | undefined>,
  onNavigate: (state: any) => void,
  vueform?: VueformInstance
): RouterHistory {
  return getRouterModule(vueform).make(active, onNavigate)
}
