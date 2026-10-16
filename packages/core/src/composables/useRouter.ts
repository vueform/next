import type { MaybeRef } from 'vue'

import type { VueformInstance } from '#src/helpers'
import { getRouterModule, type RouterHistory } from '#src/modules/router'

/**
 * Creates a history handler over the router module: push/back navigation for
 * multi-step forms plus a listener for external navigation. Setup-only when
 * called without `vueform`.
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
