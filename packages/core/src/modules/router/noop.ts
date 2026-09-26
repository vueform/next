import { unref, type MaybeRef } from 'vue'
import type { RouterModule } from './types'
import { warn, isDev } from '#core/utils'

let warnedMissingModule = false

function warnIfActive(active: MaybeRef<boolean | undefined>) {
  if (!unref(active) || warnedMissingModule) return
  warnedMissingModule = true
  if (isDev()) {
    warn(
      'history tracking is enabled but the `router` module ' +
        'is not registered; step navigation will not sync with browser ' +
        'history. Register it via `createVueform({ modules: { router } })`.'
    )
  }
}

/**
 * The inert router surface used when the `router` module is not registered —
 * behaves as if history integration wasn't there: handlers record nothing and
 * navigate nowhere. Warns once in dev when history tracking is actually
 * requested (`active` resolves to `true`).
 */
export const noopRouter: RouterModule = {
  make: (active) => {
    warnIfActive(active)
    return {
      push: () => warnIfActive(active),
      back: () => warnIfActive(active),
    }
  },
}
